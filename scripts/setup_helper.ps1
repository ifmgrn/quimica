$repoUrl = 'https://github.com/ifmgrn/quimica'


$currentDir = $PSScriptRoot
$repoName = Split-Path $repoUrl -Leaf
$repoFolder = Join-Path $currentDir $repoName
$debug = $args -match "debug"


function Prompt($msg) {
    Write-Host $msg -NoNewLine -ForegroundColor Yellow
    Read-Host
}

function Test-ExecutableInPATH($exe) {
    $null -ne (Get-Command $exe -ErrorAction SilentlyContinue)
}

function Get-Version($string, $invoke = $false) {
    if ($invoke) {
        try {
            $string = Invoke-Expression $string
        } catch {
            $string = ''
        }
    }
    if ($string -match '\d+(\.\d+)+') {
        [Version]$matches[0]
    } else { $null }
}

function Get-LatestNodeLTSVersion() {
    $releases = Invoke-RestMethod -Uri 'https://nodejs.org/dist/index.json'

    $latestLts = $releases | Where-Object { $_.lts } | Sort-Object { [Version]$_.version.TrimStart('v') } -Descending | Select-Object -First 1

    [Version]$latestLts.version.TrimStart('v')
}

function Get-LatestGitURL() {
    $releaseInfo = Invoke-RestMethod -Uri 'https://api.github.com/repos/git-for-windows/git/releases/latest'
    $installer = $releaseInfo.assets | Where-Object { $_.name -like "PortableGit-*-64-bit.7z.exe" } | Select-Object -First 1
    
    $installer.browser_download_url
}

function Get-Archive($url, $destination, $fileName) {
    if (-not $fileName) {
        $fileName = Split-Path $url -Leaf
    }
    $tempFile = Join-Path $currentDir $fileName

    if ($fileName.EndsWith('.7z.exe')) {
        Write-Host 'Clique "OK" ou pressione Enter para continuar na tela que aparecer depois do download.' -ForegroundColor Yellow
    }

    Invoke-WebRequest -Uri $url -OutFile $tempFile

    if (-not (Test-Path $destination)) {
        New-Item -Path $destination -ItemType Directory | Out-Null
    }

    if ($fileName.EndsWith('.zip')) {
        Expand-Archive -Path $tempFile -DestinationPath $destination -Force
    } elseif ($fileName.EndsWith('.7z.exe')) {
        Start-Process -FilePath $tempFile -Wait
    }

    Remove-Item $tempFile
}

function Add-ToUserPath($newPath) {
    $userCurrentPaths = [Environment]::GetEnvironmentVariable('PATH', [EnvironmentVariableTarget]::User)
    $systemCurrentPaths = [Environment]::GetEnvironmentVariable('PATH', [EnvironmentVariableTarget]::Machine)
    
    if (-not ($userCurrentPaths.Split(';') -contains $newPath) -and -not ($systemCurrentPaths.Split(';') -contains $newPath)) {
        $newPaths = if ($userCurrentPaths) { "$userCurrentPaths;$newPath" } else { $newPath }
        $env:Path = [Environment]::ExpandEnvironmentVariables("$newPaths;$systemCurrentPaths")

        if (-not $debug) {
            [Environment]::SetEnvironmentVariable('PATH', $newPaths, [EnvironmentVariableTarget]::User)
            Write-Host "`"$newPath`" foi adicionado ao seu PATH."
        }
    }
}

function Add-ToDesktop($targetPath, $fileName, $arguments) {
    $desktopPath = [Environment]::GetFolderPath('Desktop')
    $shortcutPath = Join-Path $desktopPath "$fileName.lnk"

    $wshShell = New-Object -ComObject WScript.Shell
    $shortcut = $wshShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $targetPath
    $shortcut.WorkingDirectory = Split-Path $targetPath
    if ($arguments) {
        $shortcut.Arguments = $arguments
    }

    $shortcut.Save()
}

function Update-PATH() {
    $updatePathContent = @'
$env:Path = [Environment]::ExpandEnvironmentVariables(
    [Environment]::GetEnvironmentVariable('PATH', [EnvironmentVariableTarget]::User) + ';' +
    [Environment]::GetEnvironmentVariable('PATH', [EnvironmentVariableTarget]::Machine)
)
'@
    Invoke-Expression $updatePathContent

    $targetProfile = if (-not $debug) { $PROFILE.CurrentUserAllHosts } else { Join-Path $currentDir 'profile.ps1' }
    if (-not (Test-Path -Path $targetProfile)) {
        New-Item -ItemType File -Path $targetProfile -Force | Out-Null
    }

    $content = Get-Content -Path $targetProfile -Raw
    if (-not $content -or $content -notmatch [Regex]::Escape($updatePathContent)) {
        Add-Content -Path $targetProfile -Value "`n$updatePathContent"
        Write-Host 'O Powershell agora deve priorizar o seu PATH sobre o PATH do sistema.'
    }

    if ($debug) {
        $env:PATH = @(
            (Join-Path $currentDir 'nodejs'),
            (Join-Path $currentDir 'PortableGit/cmd')
        ) -join ';'
    }
}

function Install-NodeIfNecessary() {
    $currentVersion = Get-Version 'node -v' $true
    $expectedVersion = Get-LatestNodeLTSVersion

    function Update-Pnpm() {
        Write-Host 'Atualizando npm...'
        npm update -g npm > $null

        Write-Host "Instalando/Atualizando pnpm..."
        npm install -g pnpm > $null

        Write-Host 'Instalando requerimentos do projeto...'
        pnpm --dir "$repoFolder" install -s > $null
    }
    
    if ($currentVersion -lt $expectedVersion) {
        Write-Host "Nenhum Node.js igual ou maior que v$expectedVersion foi encontrado no PATH. Baixando Node.js localmente..."
    
        $name = "node-v$expectedVersion-win-x64"
        $url = "https://nodejs.org/dist/v$expectedVersion/$name.zip"
        $newName = 'nodejs'
        $dest = Join-Path $currentDir $newName
        
        if (Test-Path $dest) {
            Write-Host 'Removendo Node.js localmente...'
            Remove-Item -Path $dest -Recurse -Force
        }

        Get-Archive $url $currentDir
        if ($?) {
            Rename-Item -Path (Join-Path $currentDir $name) -NewName $newName
            Add-ToUserPath $dest
            Add-ToUserPath (Join-Path $env:APPDATA 'npm')

            Update-Pnpm
        }
    } else {
        Update-Pnpm
    }
}

function Install-GitIfNecessary() {
    $url = Get-LatestGitURL
    $expectedVersion = Get-Version $url
    $currentVersion = Get-Version 'git -v' $true

    if ($currentVersion -lt $expectedVersion) {
        Write-Host "Nenhum Git igual ou maior que v$expectedVersion foi encontrado no PATH. Baixando Git localmente..."

        $dest = Join-Path $currentDir 'PortableGit'
        if (Test-Path $dest) {
            Write-Host 'Removendo Git localmente...'
            Remove-Item -Path $dest -Recurse -Force
        }

        Get-Archive $url $dest
        if ($?) {
            Add-ToUserPath (Join-Path $dest 'cmd')

            $gitConfig = 'git config'
            if ($debug) {
                $gitConfig += " --file $(Join-Path $currentDir '.gitconfig')"
            } else {
                $gitConfig += ' --global'
            }

            Invoke-Expression "$gitConfig user.name `"$(Prompt 'Nome que deve aparecer no Git (um que a equipe possa reconhecer): ')`""
            Invoke-Expression "$gitConfig user.email `"$(Prompt 'Email que deve aparecer no Git (para contato): ')`""
        }
    }
}

function Install-VSCodeIfNecessary() {
    $dest = Join-Path $currentDir 'Microsoft VS Code'

    if (-not (Test-Path $dest)) {
        $response = Prompt 'Deseja baixar o Visual Studio Code atualizado localmente? (s/N) '
        if ($response.ToLower() -eq 's') {
            Write-Host 'Baixando o Visual Studio Code atualizado localmente...'
            $url = 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-archive'
            Get-Archive $url $dest 'VSCode-win32-x64.zip'
            if ($?) {
                Add-ToUserPath (Join-Path $dest 'bin')
                
                if (-not $debug) {
                    $name = 'VS Code'
                    Write-Host "Adicionando Visual Studio Code para o Desktop (`"$name`")..."
                    Add-ToDesktop (Join-Path $dest 'Code.exe') $name "`"$repoFolder`""
                }
            }
        }
    }
}

function Get-Project() {
    if (-not (Test-Path $repoFolder) -and (Test-ExecutableInPATH 'git')) {
        Write-Host 'Clonando o projeto...'
        git clone -q $repoUrl "$repoFolder"
    }
}

function Start-ProjectServer() {
    if ((Test-Path $repoFolder) -and (Test-ExecutableInPATH 'pnpm')) {
        Write-Host 'Iniciando servidor local de desenvolvimento do projeto...'
        Write-Host "Para acessar o website do projeto, abra a URL: http://localhost:5173/$repoName/" -ForegroundColor Yellow
        Write-Host 'Para parar o servidor, pressione Ctrl+C.'
        pnpm --dir "$repoFolder" -s run dev --clearScreen false -l warn
    }
}


Update-PATH
Install-GitIfNecessary
Get-Project
Install-NodeIfNecessary
Install-VSCodeIfNecessary
Start-ProjectServer