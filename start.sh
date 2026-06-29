#!/bin/bash

echo "=========================================="
echo "Starting Postman Clone Application"
echo "=========================================="

# Start backend server
echo "Starting Backend Server (FastAPI on Port 8000)..."
cd backend
python -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Navigate to frontend and start
cd ../frontend
echo "Starting Frontend Server (Next.js on Port 3000)..."
npm run dev &
FRONTEND_PID=$!

echo "=========================================="
echo "Both servers are booting!"
echo "- Backend PID: $BACKEND_PID (http://127.0.0.1:8000)"
echo "- Frontend PID: $FRONTEND_PID (http://localhost:3000)"
echo "Press Ctrl+C to shut down both servers."
echo "=========================================="

# Trap SIGINT / SIGTERM to kill background tasks on script exit
trap "echo 'Shutting down servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT

# Wait for background tasks
wait
