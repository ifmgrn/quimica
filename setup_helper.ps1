$gitVersion = '2.51.0'
$nodeVersion = '22.19.0'
$repoUrl = 'https://github.com/ifmg-rn/reacoes-quimicas'


$currentDir = (Get-Location).Path


function Test-ExecutableInPATH($exe) {
    $null -ne (Get-Command $exe -ErrorAction SilentlyContinue)
}

function Get-Archive($url, $destination, $fileName) {
    if (-not $fileName) {
        $fileName = Split-Path $url -Leaf
    }
    $tempFile = Join-Path $currentDir $fileName

    Invoke-WebRequest -Uri $url -OutFile $tempFile

    if (-not (Test-Path $destination)) {
        New-Item -Path $destination -ItemType Directory | Out-Null
    }

    if ($fileName -like '*.zip') {
        Expand-Archive -Path $tempFile -DestinationPath $destination -Force
    } elseif ($fileName -like '*.7z.exe') {
        Start-Process -FilePath $tempFile -Wait
    }

    Remove-Item $tempFile
}

function Add-ToUserPath($newPath) {
    $userCurrentPaths = [Environment]::GetEnvironmentVariable('PATH', [EnvironmentVariableTarget]::User)
    $systemCurrentPaths = [Environment]::GetEnvironmentVariable('PATH', [EnvironmentVariableTarget]::Machine)
    if (-not ($userCurrentPaths.Split(';') -contains $newPath) -and -not ($systemCurrentPaths.Split(';') -contains $newPath)) {
        $newPaths = if ($userCurrentPaths) { "$userCurrentPaths;$newPath" } else { $newPath }
        [Environment]::SetEnvironmentVariable('PATH', $newPaths, [EnvironmentVariableTarget]::User)
        $env:Path = [Environment]::ExpandEnvironmentVariables("$newPaths;$systemCurrentPaths")

        Write-Host "`"$newPath`" foi adicionado ao seu PATH."
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


$updatePathContent = @'
$env:Path = [Environment]::ExpandEnvironmentVariables(
    [Environment]::GetEnvironmentVariable('PATH', [EnvironmentVariableTarget]::User) + ';' +
    [Environment]::GetEnvironmentVariable('PATH', [EnvironmentVariableTarget]::Machine)
)
'@
Invoke-Expression $updatePathContent
$targetProfile = $PROFILE.CurrentUserAllHosts
if (-not (Test-Path -Path $targetProfile)) {
    New-Item -ItemType File -Path $targetProfile -Force | Out-Null
}
$content = Get-Content -Path $targetProfile -Raw
if (-not $content -or $content -notmatch [Regex]::Escape($updatePathContent)) {
    Add-Content -Path $targetProfile -Value "`n$updatePathContent"
    Write-Host 'O Powershell agora deve priorizar o seu PATH sobre o PATH do sistema.'
}


if (-not (Test-ExecutableInPATH 'git')) {
    Write-Host 'Nenhum Git foi encontrado no PATH. Baixando Git localmente...'
    $url = "https://github.com/git-for-windows/git/releases/download/v$gitVersion.windows.1/PortableGit-$gitVersion-64-bit.7z.exe"
    $dest = Join-Path $currentDir 'PortableGit'
    Write-Host 'Click OK ou pressione Enter para continuar na tela que aparecer depois do download.' -ForegroundColor Yellow
    Get-Archive $url $dest
    if ($?) {
        Add-ToUserPath (Join-Path $dest 'cmd')
        git config --global user.name "$(Read-Host 'Qual nome deve aparecer no Git (pode ser o mesmo nome que aparece no GitHub)?')"
        git config --global user.email "$(Read-Host 'Qual email deve aparecer no Git (pode ser o mesmo email que aparece no GitHub)?')"
    }
}


try {
    $nodeVersionOutput = node -v
    $currentVersion = [version]$nodeVersionOutput.TrimStart('v')
} catch {
    $currentVersion = $null
}
if (-not $currentVersion -or $currentVersion -lt [version]$nodeVersion) {
    Write-Host "Nenhum Node.js igual ou maior que v$nodeVersion foi encontrado no PATH. Baixando Node.js localmente..."
    
    $name = "node-v$nodeVersion-win-x64"
    $url = "https://nodejs.org/dist/v$nodeVersion/$name.zip"
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
        Add-ToUserPath "$env:APPDATA\npm"
        npm update -g npm > $null
    }
}
if (-not (Test-ExecutableInPATH 'pnpm')) {
    Write-Host 'Instalando pnpm globalmente...'
    npm install -g pnpm > $null
}


$repoFolder = Join-Path $currentDir (Split-Path $repoUrl -Leaf)
if (-not (Test-Path $repoFolder)) {
    Write-Host 'Clonando o projeto...'
    git clone -q $repoUrl "$repoFolder"
}
pnpm --dir "$repoFolder" install -s


$dest = Join-Path $currentDir 'Microsoft VS Code'
$exe = Join-Path $dest 'Code.exe'
if (-not (Test-Path $dest)) {
    Write-Host 'Deseja baixar o Visual Studio Code atualizado localmente? (s/N) ' -NoNewLine -ForegroundColor Yellow
    $response = Read-Host
    if ($response -match '^[Ss]$') {
        Write-Host 'Baixando o Visual Studio Code atualizado localmente...'
        $url = 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-archive'
        Get-Archive $url $dest 'VSCode-win32-x64.zip'
        if ($?) {
            Add-ToUserPath (Join-Path $dest 'bin')
            Write-Host 'Adicionando Visual Studio Code para o Desktop ("VS Code")...'
            Add-ToDesktop $exe 'VS Code' "`"$repoFolder`""
        }
    }
}


Write-Host 'Iniciando servidor local de desenvolvimento do projeto...'
Write-Host 'Para acessar o website do projeto, abra a URL: http://localhost:5173/reacoes-quimicas/' -ForegroundColor Yellow
Write-Host 'Para parar o servidor, pressione Ctrl+C.'
pnpm --dir "$repoFolder" -s run dev --clearScreen false -l warn