@echo off
echo ========================================================
echo Starting AuraPrice AI - House Price Prediction App
echo ========================================================
echo.
cd /d "%~dp0backend"
echo Launching Python Backend & Web Server...
echo Open http://localhost:5000 in your browser.
echo.
call "C:\Users\MSI\anaconda3\python.exe" app.py
pause
