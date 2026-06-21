@echo off
cd /d "%~dp0.."
echo Generating favicons...
node scripts/generate-favicons-standalone.mjs
if %errorlevel% equ 0 (
    echo Success!
) else (
    echo Failed. Make sure Node.js is installed.
)
pause
