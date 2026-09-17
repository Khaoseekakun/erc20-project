@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo           ERC20 Project Installation Setup
echo ===================================================
echo.

:: 1. Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH!
    echo Please install Node.js from: https://nodejs.org/
    goto :error
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [OK] Node.js found: %NODE_VER%
echo.

:: 2. Check NPM
echo Checking NPM...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] NPM is not installed or not found in PATH!
    echo Please ensure NPM is properly installed.
    goto :error
)
for /f "tokens=*" %%v in ('npm -v') do set NPM_VER=%%v
echo [OK] NPM found: v%NPM_VER%
echo.

echo All prerequisites are ready! Starting dependency installation...
echo.

:: Change directory to where this script is located
cd /d "%~dp0"

:: Install Backend
echo ===================================================
echo [1/3] Installing Backend dependencies...
echo ===================================================
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Backend dependencies!
    goto :error
)
cd ..

:: Install Frontend
echo.
echo ===================================================
echo [2/3] Installing Frontend dependencies...
echo ===================================================
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Frontend dependencies!
    goto :error
)
cd ..

:: Install Blockchain
echo.
echo ===================================================
echo [3/3] Installing Blockchain dependencies...
echo ===================================================
cd blockchain
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Blockchain dependencies!
    goto :error
)
cd ..

echo.
echo ===================================================
echo   [SUCCESS] All dependencies installed successfully!
echo ===================================================
echo.
pause
exit /b 0

:error
echo.
echo ===================================================
echo   [FAILED] Installation process encountered an error!
echo ===================================================
echo.
pause
exit /b 1