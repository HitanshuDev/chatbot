@echo off
REM ===========================================================
REM Chatbot Platform - Local Development Startup Script
REM ===========================================================
REM This script starts the entire application locally without Docker
REM Prerequisites: Node.js, MongoDB, Redis

setlocal enabledelayedexpansion

echo.
echo =========================================================
echo   Chatbot Platform - Local Development Startup
echo =========================================================
echo.

REM Check for Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found
node --version

REM Check for MongoDB
echo.
echo Checking MongoDB...
where mongod >nul 2>&1
if errorlevel 1 (
    echo ⚠ Warning: MongoDB not found in PATH
    echo Make sure MongoDB is running on localhost:27017
    echo Download from: https://www.mongodb.com/try/download/community
) else (
    echo ✓ MongoDB found
)

REM Check for Redis
echo.
echo Checking Redis...
where redis-server >nul 2>&1
if errorlevel 1 (
    echo ⚠ Warning: Redis not found in PATH
    echo Make sure Redis is running on localhost:6379
    echo Download from: https://github.com/microsoftarchive/redis/releases
) else (
    echo ✓ Redis found
)

REM Display prerequisites
echo.
echo =========================================================
echo Prerequisites Status:
echo =========================================================
echo - Node.js: ✓ Installed
echo - MongoDB: Make sure it's running on localhost:27017
echo - Redis: Make sure it's running on localhost:6379
echo.

REM Create .env file in root if needed
if not exist ".env" (
    echo Creating .env file...
    (
        echo # OpenAI Configuration
        echo # Replace with your actual OpenAI API key
        echo OPENAI_API_KEY=sk-your-api-key-here
        echo.
        echo # Google OAuth (Optional^)
        echo # GOOGLE_CLIENT_ID=your-google-client-id
        echo # GOOGLE_CLIENT_SECRET=your-google-client-secret
    ) > .env
    echo ✓ Created .env file (update with your API keys)
)

REM Start backend
echo.
echo =========================================================
echo Starting Backend (http://localhost:5000)...
echo =========================================================
echo.

cd backend
start "Chatbot Backend" cmd /k npm run dev
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend
echo.
echo =========================================================
echo Starting Frontend (http://localhost:3000)...
echo =========================================================
echo.

cd frontend
start "Chatbot Frontend" cmd /k npm run dev
cd ..

REM Wait for startup to complete
timeout /t 5 /nobreak

REM Display startup information
echo.
echo =========================================================
echo ✓ Application Starting...
echo =========================================================
echo.
echo Access your application at:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:5000
echo   API:       http://localhost:5000/v1
echo.
echo Backend terminal:  "Chatbot Backend" window
echo Frontend terminal: "Chatbot Frontend" window
echo.
echo To stop the application, close both terminal windows.
echo.
echo =========================================================
echo Tips:
echo - Make sure MongoDB is running before starting
echo - Make sure Redis is running before starting
echo - Check backend console for any connection errors
echo - Frontend will auto-reload on file changes
echo =========================================================
echo.

pause
