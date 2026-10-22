@echo off

cd /d "%~dp0"

echo Starting MedIntel AI local server...
echo.

python -m http.server 8000

pause