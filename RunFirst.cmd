@echo off
chcp 65001 >nul
title BlockWallet - First Time Setup (RunFirst)
cd /d "%~dp0"

echo ===================================================
echo        BlockWallet - First Time Setup (RunFirst)
echo ===================================================
echo.

:: 1. Check Node.js & NPM
echo [1/5] Checking Node.js and NPM...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH!
    echo Please download and install Node.js from: https://nodejs.org/
    goto :error
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] NPM is not installed or not found in PATH!
    goto :error
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
for /f "tokens=*" %%v in ('npm -v') do set NPM_VER=%%v
echo [OK] Node.js (%NODE_VER%) and NPM (v%NPM_VER%) are ready.
echo.

:: 2. Check & Initialize .env files from .env.example
echo [2/5] Checking Environment Files (.env)...

if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo [CREATED] backend\.env copied from backend\.env.example
    ) else (
        echo [WARNING] backend\.env.example not found!
    )
) else (
    echo [EXISTS] backend\.env already exists.
)

if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env" >nul
        echo [CREATED] frontend\.env copied from frontend\.env.example
    ) else (
        echo [WARNING] frontend\.env.example not found!
    )
) else (
    echo [EXISTS] frontend\.env already exists.
)

if not exist "blockchain\.env" (
    if exist "blockchain\.env.example" (
        copy "blockchain\.env.example" "blockchain\.env" >nul
        echo [CREATED] blockchain\.env copied from blockchain\.env.example
    ) else (
        echo [WARNING] blockchain\.env.example not found!
    )
) else (
    echo [EXISTS] blockchain\.env already exists.
)
echo.

:: 3. Install Dependencies
echo [3/5] Installing all dependencies...
call "%~dp0install.cmd"
if %errorlevel% neq 0 (
    echo [ERROR] Dependency installation failed!
    goto :error
)
echo.

:: 4. Generate Prisma Client (Backend)
echo [4/5] Generating Prisma Client for Backend...
cd "%~dp0backend"
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client!
    goto :error
)
cd "%~dp0"
echo [OK] Prisma Client generated successfully.
echo.

:: 5. Compile Smart Contracts (Blockchain)
echo [5/5] Compiling Smart Contracts...
cd "%~dp0blockchain"
call npx hardhat compile
if %errorlevel% neq 0 (
    echo [WARNING] Smart contracts compilation had an issue, but setup can continue.
) else (
    echo [OK] Smart contracts compiled successfully.
)
cd "%~dp0"
echo.

echo ===================================================
echo     [SUCCESS] First-Time Setup Completed!
echo ===================================================
echo.
echo Next steps:
echo 1. Check your .env files (backend\.env, blockchain\.env)
echo    - Ensure your MySQL database is running and configured
echo    - In backend, run "npx prisma migrate dev" if needed
echo 2. Run "RunSystem.cmd" to launch both Backend and Frontend!
echo.
pause
exit /b 0

:error
echo.
echo ===================================================
echo        [FAILED] Setup encountered an error!
echo ===================================================
echo.
pause
exit /b 1

