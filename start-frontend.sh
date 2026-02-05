#!/bin/bash

# Frontend startup script
cd /home/julius/Desktop/ZIE/frontend

echo "Installing dependencies..."
npm install

echo ""
echo "Starting Angular development server..."
echo "Frontend will be available at http://localhost:4200"
echo ""

ng serve --host 0.0.0.0 --port 4200
