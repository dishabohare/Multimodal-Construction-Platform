@echo off
echo ========================================================
echo   Starting BuildMind AI Construction Platform
echo ========================================================

echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "BuildMind Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Frontend on http://127.0.0.1:5173 ...
start "BuildMind Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ========================================================
echo   Platform is running!
echo   Frontend: http://127.0.0.1:5173
echo   Backend:  http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo.
pause
