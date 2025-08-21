$gitVersion = '2.51.0'
$nodeVersion = 'node-v22.18.0-win-x64'
$repoUrl = 'https://github.com/ifmg-rn/reacoes-quimicas'


$currentDir = (Get-Location).Path
if (Test-Path $(Join-Path $currentDir '.git')) {
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
        return Start-Process -FilePath $tempFile -PassThru
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
    $gitName = "PortableGit-$gitVersion-64-bit.7z.exe"
    $gitUrl = "https://github.com/git-for-windows/git/releases/download/v$gitVersion.windows.1/$gitName"
    $gitDest = Join-Path $currentDir 'PortableGit'
    Write-Host 'Click OK ou pressione Enter para continuar na tela que aparecer.' -ForegroundColor Yellow
    $gitProcess = Get-Archive $gitUrl $gitDest

    $gitBinPath = Join-Path $gitDest 'cmd'
    Add-ToUserPath $gitBinPath
}

if (-not (Test-ExecutableInPATH 'node')) {
    Write-Host 'Nenhum Node.js foi encontrado no PATH. Baixando Node.js localmente...'
    $nodeUrl = "https://nodejs.org/dist/v22.18.0/$nodeVersion.zip"
    Get-Archive $nodeUrl $currentDir

    $nodeDest = Join-Path $currentDir $nodeVersion
    Add-ToUserPath $nodeDest
    Add-ToUserPath "$env:APPDATA\npm"
}

if (-not (Test-ExecutableInPATH 'pnpm')) {
    Write-Host 'Instalando pnpm globalmente...'
    npm install -g pnpm > $null
}

if ($gitProcess) {
    Wait-Process -ID $gitProcess.ID *> $null
}
if ($gitName) {
    $gitInstaller = Join-Path $currentDir $gitName
    if (Test-Path $gitInstaller) {
        Remove-Item $gitInstaller
    }
}

$repoFolder = Join-Path $currentDir $(Split-Path $repoUrl -Leaf)
if (-not (Test-Path $repoFolder)) {
    Write-Host 'Clonando o projeto...'
    git clone -q "$repoUrl.git" $repoFolder
}

Push-Location $repoFolder
Write-Host 'Atualizando o projeto conforme a necessidade...'
git pull -q
Write-Host 'Instalando bibliotecas do projeto...'
pnpm install -s
Pop-Location

$vscodeDest = Join-Path $currentDir 'PortableVSCode'
$vscodeExe = Join-Path $vscodeDest 'Code.exe'
if (-not (Test-Path $vscodeDest)) {
    Write-Host 'Deseja baixar o VS Code atualizado localmente? (s/N) ' -NoNewLine -ForegroundColor Yellow
    $response = Read-Host
    if ($response -match '^[Ss]$') {
        Write-Host 'Baixando o VS Code atualizado localmente...'
        $vscodeUrl = 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-archive'
        Get-Archive $vscodeUrl $vscodeDest "VSCode-win32-x64.zip"

        Write-Host 'Adicionando VS Code para o Desktop ("VS Code Local")...'
        Add-ToDesktop $vscodeExe 'VS Code Local' "`"$repoFolder`""
    }
}

Write-Host 'Iniciando servidor local de desenvolvimento do projeto...'
Write-Host 'Para acessar o website do projeto, abra a URL: http://localhost:5173/reacoes-quimicas/'
Write-Host 'Para parar o servidor, pressione Ctrl+C.'
pnpm --dir $repoFolder run dev > $null