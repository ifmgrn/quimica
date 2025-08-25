$gitVersion = '2.51.0'
$nodeVersion = '22.18.0'
$repoUrl = 'https://github.com/ifmg-rn/reacoes-quimicas'


$currentDir = (Get-Location).Path
if (Test-Path (Join-Path $currentDir '.git')) {
    Write-Host 'Parece que estamos num projeto Git; execute este script fora dele.'
    Exit
}

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

        Write-Host "Adicionei '$newPath' ao seu PATH."
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

if (-not (Test-ExecutableInPATH 'git')) {
    Write-Host 'Nenhum Git foi encontrado no PATH. Baixando Git localmente...'
    $url = "https://github.com/git-for-windows/git/releases/download/v$gitVersion.windows.1/PortableGit-$gitVersion-64-bit.7z.exe"
    $dest = Join-Path $currentDir 'PortableGit'
    Write-Host 'Click OK ou pressione Enter para continuar na tela que aparecer depois do download.' -ForegroundColor Yellow
    Get-Archive $url $dest
    if ($?) {
        Add-ToUserPath (Join-Path $dest 'cmd')
    }
}

if (-not (Test-ExecutableInPATH 'node')) {
    Write-Host 'Nenhum Node.js foi encontrado no PATH. Baixando Node.js localmente...'
    $name = "node-v$nodeVersion-win-x64"
    $url = "https://nodejs.org/dist/v$nodeVersion/$name.zip"
    Get-Archive $url $currentDir
    if ($?) {
        Add-ToUserPath (Join-Path $currentDir $name)
        Add-ToUserPath "$env:APPDATA\npm"
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

Push-Location $repoFolder
Write-Host 'Atualizando o projeto conforme a necessidade...'
git pull -q
Write-Host 'Instalando bibliotecas do projeto...'
pnpm install -s
Pop-Location

$dest = Join-Path $currentDir 'PortableVSCode'
$exe = Join-Path $dest 'Code.exe'
if (-not (Test-Path $dest)) {
    Write-Host 'Deseja baixar o VS Code atualizado localmente? (s/N) ' -NoNewLine -ForegroundColor Yellow
    $response = Read-Host
    if ($response -match '^[Ss]$') {
        Write-Host 'Baixando o VS Code atualizado localmente...'
        $url = 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-archive'
        Get-Archive $url $dest 'VSCode-win32-x64.zip'
        if ($?) {
            Write-Host 'Adicionando VS Code para o Desktop ("VS Code Local")...'
            Add-ToDesktop $exe 'VS Code Local' "`"$repoFolder`""
        }
    }
}

Write-Host 'Iniciando servidor local de desenvolvimento do projeto...'
Write-Host 'Para acessar o website do projeto, abra a URL: http://localhost:5173/reacoes-quimicas/' -ForegroundColor Yellow
Write-Host 'Para parar o servidor, pressione Ctrl+C.'
pnpm --dir "$repoFolder" run dev > $null