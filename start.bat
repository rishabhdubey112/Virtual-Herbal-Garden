@echo off
echo ==============================================
echo   STARTING VIRTUAL HERBAL GARDEN ECOSYSTEM
echo ==============================================
echo.
echo Launching Python Backend inside a new window...
start cmd /k "cd backend & title Backend (Flask AI) & python app.py"

echo Launching React Frontend inside a new window...
start cmd /k "cd frontend & title Frontend (React UI) & npm run dev"

echo.
echo SUCCESS: Both servers are starting up! 
echo Feel free to minimize this specific window (it will auto-close).
timeout /t 5 >nul
exit
