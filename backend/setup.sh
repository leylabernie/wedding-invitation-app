#!/bin/bash

echo "🚀 Setting up Wedding Invitation Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads/exports
mkdir -p uploads/assets
mkdir -p uploads/temp

# Copy environment file
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template. Please update it with your configuration."
else
    echo "ℹ️ .env file already exists."
fi

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is available on your system."
else
    echo "⚠️ MongoDB not found. You can either:"
    echo "   1. Install MongoDB locally"
    echo "   2. Use MongoDB Atlas (cloud)"
    echo "   3. Update MONGODB_URI in .env for your setup"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your configuration"
echo "2. Start MongoDB (if running locally)"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "API will be available at: http://localhost:5000"
echo "Health check: http://localhost:5000/health"
echo ""
echo "📚 API Documentation:"
echo "POST /api/auth/register - Register new user"
echo "POST /api/auth/login - Login user"
echo "GET  /api/events - Get user events"
echo "POST /api/events - Create new event"
echo "GET  /api/guests/event/:eventId - Get event guests"
echo "POST /api/guests/event/:eventId - Add guest"
echo ""
echo "🔧 Development commands:"
echo "npm run dev - Start development server with nodemon"
echo "npm start - Start production server"
echo "npm test - Run tests"