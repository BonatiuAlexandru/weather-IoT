@echo off
cd /d "%~dp0"
echo ============================================
echo   WeatherIoT - configurare (o singura data)
echo ============================================
echo.
echo [1/4] Backend: instalez pachetele...
cd backend
if not exist .env copy .env.example .env >nul
call npm install
if errorlevel 1 goto eroare
cd ..
echo.
echo [2/4] Aplicatia mobila...
if exist mobile\package.json goto mobil_install
echo Creez proiectul Expo (dureaza 1-3 minute)...
call npx create-expo-app@latest mobile --template blank-typescript
if errorlevel 1 goto eroare
cd mobile
call npx expo install @react-native-async-storage/async-storage expo-secure-store
if errorlevel 1 goto eroare
cd ..
if exist mobile-src xcopy /E /Y /I mobile-src\* mobile\ >nul
goto ip
:mobil_install
echo Proiectul Expo exista deja, instalez pachetele...
cd mobile
call npm install
if errorlevel 1 goto eroare
cd ..
:ip
echo.
echo [3/4] Setez IP-ul calculatorului in aplicatie...
if not exist mobile\src mkdir mobile\src
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\set-ip.ps1
echo.
echo [4/4] Gata.
echo ============================================
echo   GATA. Acum ruleaza: start-backend.bat
echo   apoi (in alta fereastra): start-app.bat
echo ============================================
pause
exit /b 0
:eroare
echo.
echo A aparut o eroare. Copiaza textul de mai sus si trimite-l.
pause
exit /b 1
