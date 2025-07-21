@echo off
set PORT=%1
if "%PORT%"=="" set PORT=3500

echo Killing processes on port %PORT%...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT%') do (
    echo Killing PID %%a
    taskkill /F /PID %%a 2>nul
)

echo Done.