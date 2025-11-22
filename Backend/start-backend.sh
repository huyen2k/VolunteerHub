#!/bin/bash

# Script to start Spring Boot backend

echo "🚀 Starting VolunteerHub Backend..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with MongoDB connection details"
    exit 1
fi

# Load environment variables
export $(cat .env | xargs)

# Check if port 8080 is already in use
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "⚠️  Port 8080 is already in use"
    echo "Stopping existing process..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Start backend
echo "📦 Building and starting backend..."
echo ""

./mvnw clean spring-boot:run

