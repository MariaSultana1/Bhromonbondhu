@echo off
setlocal enabledelayedexpansion

REM Messages API Testing Script for Windows
REM Run this to verify the backend endpoints are working correctly

set API_URL=http://localhost:5000/api
set TOKEN=

echo ================================
echo Messages API Testing Script
echo ================================
echo.

REM 1. Check if server is running
echo 1. Checking if server is running...
powershell -Command "try { (Invoke-WebRequest -Uri '%API_URL%/messages/conversations' -Headers @{'Authorization'='Bearer test'} -ErrorAction Stop) | Out-Null; Write-Host 'OK' } catch { exit 1 }" >nul 2>&1

if errorlevel 1 (
    echo X Server is not responding. Start it with: npm start (in server directory)
    pause
    exit /b 1
) else (
    echo OK - Server is running
)
echo.

REM 2. Get token from user
echo 2. Getting authentication token...
echo Please provide your API token (from localStorage in browser):
set /p TOKEN=Token: 

if "!TOKEN!"=="" (
    echo X No token provided. Cannot continue without authentication.
    pause
    exit /b 1
)
echo OK - Using token: !TOKEN:~0,20!...
echo.

REM 3. Test GET /api/messages/conversations
echo 3. Testing GET /api/messages/conversations...

for /f "delims=" %%i in ('powershell -Command "(Invoke-WebRequest -Uri '%API_URL%/messages/conversations' -Headers @{'Authorization'='Bearer !TOKEN!';'Content-Type'='application/json'} -ErrorAction SilentlyContinue).Content" 2^>nul') do set RESPONSE=%%i

echo Response received (check for "success": true)
if "!RESPONSE!"=="" (
    echo X No response or endpoint not found
) else (
    if "!RESPONSE:success=!" neq "!RESPONSE!" (
        echo OK - Endpoint works
        echo.
        echo Response sample:
        echo !RESPONSE:~0,200!...
    ) else (
        echo X Endpoint returned error
        echo !RESPONSE!
    )
)
echo.

REM 4. Display next steps
echo ================================
echo Testing Help
echo ================================
echo.
echo For more detailed testing and debugging:
echo.
echo 1. Open Browser DevTools (F12)
echo 2. Go to Console tab
echo 3. Check for messages with emoji prefixes (📨, ✅, ❌, 📤)
echo.
echo Command-line test with curl (if installed):
echo.
echo curl -H "Authorization: Bearer !TOKEN!" "%API_URL%/messages/conversations"
echo.
echo Or test in PowerShell:
echo.
echo $headers = @{ 'Authorization' = 'Bearer !TOKEN!' }
echo (Invoke-WebRequest '%API_URL%/messages/conversations' -Headers $headers).Content
echo.
pause
