@echo off
echo =============================================
echo  Dutch Auction Game - Optimize for Deploy
echo =============================================
echo.

echo Step 1: Building client...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build client
    pause
    exit /b 1
)

echo.
echo Step 2: Cleaning up development files...
cd ..

echo Removing client development dependencies...
rmdir /s /q "client\node_modules" 2>nul

echo.
echo Step 3: Server setup...
cd server
call npm install --production
if %errorlevel% neq 0 (
    echo Error: Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo =============================================
echo  OPTIMIZATION COMPLETE!
echo =============================================
echo.
echo Removed:
echo - client/node_modules (can be rebuilt with npm install)
echo.
echo Kept:
echo - client/src/ (source code for future updates)
echo - client/dist/ (built files served by server)
echo - client/package.json (build configuration)
echo.
echo To rebuild client: cd client && npm install && npm run build
echo.
echo Starting server...
echo.

call npm start