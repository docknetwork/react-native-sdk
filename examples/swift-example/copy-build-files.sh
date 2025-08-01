#!/bin/bash

# Remove old files from wallet-sdk-web
if [ -d "./wallet-sdk-web" ]; then
    rm -rf ./wallet-sdk-web/*
    echo "Removed old files"
fi

# Create directory if it doesn't exist
mkdir -p ./wallet-sdk-web

# Copy build files from webview-server to wallet-sdk-web
cp -r ../webview-server/build/* ./wallet-sdk-web/

# Update index.html to replace src="/main. with src="main.
if [ -f "./wallet-sdk-web/index.html" ]; then
    sed -i '' 's|src="/main\.|src="main.|g' ./wallet-sdk-web/index.html
    echo "Updated index.html"
fi

echo "Build files copied successfully"