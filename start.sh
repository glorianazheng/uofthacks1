#!/bin/bash

# Start script for Bet → Consequence App
# This script starts both backend and frontend servers

echo "🚀 Starting Bet → Consequence App..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Start backend in background
echo "📦 Starting backend server..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
fi
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend server..."
cd my-react-router-app
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers started!"
echo "📊 Backend: http://localhost:3001"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
