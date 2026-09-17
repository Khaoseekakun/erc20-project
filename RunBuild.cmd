@echo off
title BlockWallet - Project Build
cd /d "%~dp0"

echo ===================================================
echo             Building BlockWallet Project
echo ===================================================
echo.

:: 1. Check Node.js & NPM
echo Checking Node.js and NPM...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH!
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

:: 2. Build Blockchain Contracts
echo ===================================================
echo [1/3] Compiling Blockchain Smart Contracts...
echo ===================================================
cd /d "%~dp0blockchain"
call npm run compile
if %errorlevel% neq 0 (
    echo [ERROR] Blockchain smart contracts compilation failed!
    goto :error
)
echo [OK] Blockchain compiled successfully.
echo.

:: 3. Build Backend
echo ===================================================
echo [2/3] Building Backend (TypeScript ^& Prisma)...
echo ===================================================
cd /d "%~dp0backend"
echo Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Prisma Client generation failed!
    goto :error
)

echo Compiling Backend TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed!
    goto :error
)
echo [OK] Backend build completed successfully (output: backend\dist).
echo.

:: 4. Build Frontend
echo ===================================================
echo [3/3] Building Frontend (React ^& Vite)...
echo ===================================================
cd /d "%~dp0frontend"
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    goto :error
)
echo [OK] Frontend build completed successfully (output: frontend\dist).
echo.

:: Return to project root
cd /d "%~dp0"

echo ===================================================
echo       [SUCCESS] All Projects Built Successfully!
echo ===================================================
echo   - Blockchain : artifacts generated
echo   - Backend    : backend\dist ready
echo   - Frontend   : frontend\dist ready
echo ===================================================
echo.
pause
exit /b 0

:error
cd /d "%~dp0"
echo.
echo ===================================================
echo            [FAILED] Build Failed!
echo ===================================================
echo.
pause
exit /b 1

