#!/bin/bash

echo "Starting backend in background..."
cd /home/julius/Desktop/ZIE/backend
npx ts-node src/index.ts &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

echo "Testing registration..."
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","role":"Applicant"}' | python3 -m json.tool

echo ""
echo "Testing login with correct password..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}' | python3 -m json.tool

echo ""
echo "Testing login with incorrect password..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}' | python3 -m json.tool

# Kill backend
kill $BACKEND_PID
