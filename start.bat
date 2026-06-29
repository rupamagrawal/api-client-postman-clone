@echo off
echo ==========================================
echo Starting Postman Clone Application
echo ==========================================

echo Starting Backend Server (FastAPI on Port 8000)...
start cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

echo Starting Frontend Server (Next.js on Port 3000)...
start cmd /k "cd frontend && npm run dev"

echo ==========================================
echo Servers are booting in separate windows!
echo - Backend: http://127.0.0.1:8000
echo - Frontend: http://localhost:3000
echo ==========================================
pause
