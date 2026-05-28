@echo off
:: Install ClickUp CLI as a global `clickup` command (Windows CMD)

cd /d "%~dp0.."

echo.
echo   ClickUp CLI -- Install
echo   -----------------------------------------
echo.

:: 1. Install dependencies
if not exist "node_modules" (
  echo   [1/3] Installing dependencies...
  call npm install --silent
) else (
  echo   [1/3] Dependencies already installed.
)

:: 2. Build
echo   [2/3] Building...
call npm run build --silent
if %errorlevel% neq 0 exit /b %errorlevel%

:: 3. Link globally
echo   [3/3] Linking as global command...
call npm link --silent
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo   Done!
echo.
echo   You can now run from anywhere:
echo     clickup --help
echo     clickup auth add
echo     clickup browse
echo.
echo   To uninstall later:
echo     npm unlink -g clickup-cli
echo.
