@echo off
echo Starting Cross-Bookmark Application...
echo.

echo Starting Backend Server...
start cmd /k "cd /d %~dp0 && python -m uvicorn backend.app:app --reload"

echo.
echo Starting Frontend...
start "" "F:\projecys\Cross-Bookmark\frontend\index.html"

echo.
echo Cross-Bookmark has been started:
echo - Backend is running at http://127.0.0.1:8000
echo - Frontend has been opened in your default browser
echo.
echo Press any key to exit this window...
pause > nul