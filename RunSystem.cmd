@echo off
title BlockWallet - System (Single CMD Window)
cd /d "%~dp0"

echo ===================================================
echo            Starting BlockWallet System
echo ===================================================
echo.

:: 1. Check Node.js & NPM
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in PATH!
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] NPM is not installed or not found in PATH!
    pause
    exit /b 1
)

:: 2. Check if dependencies are installed
if not exist "backend\node_modules" (
    echo [WARNING] backend\node_modules not found!
    echo Please run RunFirst.cmd or install.cmd first.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [WARNING] frontend\node_modules not found!
    echo Please run RunFirst.cmd or install.cmd first.
    pause
    exit /b 1
)

echo Launching Backend and Frontend in this single window...
echo ---------------------------------------------------
echo - Backend API  : http://localhost:4000 (or port in .env)
echo - Frontend UI  : http://localhost:1233
echo ---------------------------------------------------
echo Press [Ctrl + C] or close this window to stop both servers.
echo ===================================================
echo.

:: Run both Backend and Frontend concurrently in the same CMD window
:: --kill-others (-k): If one stops or Ctrl+C is pressed, terminate both
call npx --yes concurrently --kill-others --names "BACKEND,FRONTEND" --prefix-colors "cyan.bold,green.bold" "npm --prefix backend run start" "npm --prefix frontend run preview"

echo.
echo ===================================================
echo   Both servers have stopped.
echo ===================================================
pause
