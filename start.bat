@echo off
REM Windows batch script to start the Docker Compose application

echo.
echo ========================================
echo   Chatbot Platform - Docker Startup
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✓ Docker found
echo.

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker Compose is not available
    echo Please ensure Docker Desktop is properly installed
    pause
    exit /b 1
)

echo ✓ Docker Compose found
echo.

REM Check for .env file
if not exist .env (
    echo ⚠ Warning: .env file not found
    echo Creating .env file with default values...
    echo Please edit it with your API keys before proceeding
    echo.
    copy nul .env
    (
        echo # OpenAI Configuration
        echo # Replace with your actual OpenAI API key
        echo OPENAI_API_KEY=sk-your-api-key-here
        echo.
        echo # Google OAuth (Optional^)
        echo # GOOGLE_CLIENT_ID=your-google-client-id
        echo # GOOGLE_CLIENT_SECRET=your-google-client-secret
    ) > .env
    echo Created .env file. Please edit it with your API keys.
    echo.
    pause
)

echo Starting Docker Compose...
echo.
echo Services will be available at:
echo   - Frontend:  http://localhost:3001
echo   - Backend:   http://localhost:3000
echo   - API:       http://localhost:3000/v1
echo.
echo Press Ctrl+C to stop all services
echo.

docker compose up

pause
