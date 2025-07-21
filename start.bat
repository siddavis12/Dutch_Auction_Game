@echo off
echo Starting Dutch Auction Game...

echo.
echo Step 1: Killing existing processes on ports 3000 and 3001...
cd server
call kill-port-win.bat 3001
cd ../client
call ../server/kill-port-win.bat 3000
cd ..

echo.
echo Step 2: Starting server...
start "Dutch Auction Server" cmd /k "cd server && npm run start"

echo.
echo Step 3: Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo Step 4: Starting client...
start "Dutch Auction Client" cmd /k "cd client && npm run dev"

echo.
echo Game is starting!
echo Server: http://localhost:3001
echo Client: http://localhost:3000
echo.
pause