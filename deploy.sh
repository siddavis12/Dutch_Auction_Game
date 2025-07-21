#!/bin/bash

echo "============================================="
echo " Dutch Auction Game - Deployment Script"
echo "============================================="
echo

echo "Step 1: Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install server dependencies"
    exit 1
fi

echo
echo "Step 2: Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install client dependencies"
    exit 1
fi

echo
echo "Step 3: Building client for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Failed to build client"
    exit 1
fi

echo
echo "Step 4: Starting server..."
cd ../server
echo
echo "============================================="
echo " DEPLOYMENT COMPLETE!"
echo "============================================="
echo
echo "The server will start now. Users can connect by:"
echo "1. Opening a web browser"
echo "2. Navigating to one of the IP addresses shown below"
echo
echo "Press Ctrl+C to stop the server when done."
echo
echo "Starting server..."
echo

npm start