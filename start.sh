#!/bin/bash

# Linux/Mac shell script to start the Docker Compose application

echo ""
echo "========================================"
echo "   Chatbot Platform - Docker Startup"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✓ Docker found"
echo ""

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not available"
    echo "Please ensure Docker is properly installed"
    exit 1
fi

echo "✓ Docker Compose found"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠ Warning: .env file not found"
    echo "Creating .env file with default values..."
    cat > .env << 'EOF'
# OpenAI Configuration
# Replace with your actual OpenAI API key
OPENAI_API_KEY=sk-your-api-key-here

# Google OAuth (Optional)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
EOF
    echo "Created .env file. Please edit it with your API keys."
    echo ""
fi

echo "Starting Docker Compose..."
echo ""
echo "Services will be available at:"
echo "  - Frontend:  http://localhost:3001"
echo "  - Backend:   http://localhost:3000"
echo "  - API:       http://localhost:3000/v1"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

docker compose up
