#!/bin/bash
# Launch iOS Simulator with Agentic Healthcare App

echo "🚀 Starting Agentic Healthcare App..."
echo ""

# Change to mobile directory
cd /Users/rohitmangalsinggothwal/Desktop/ProjectsCyber/agentic-healthcare-assistant/mobile

echo "📱 Starting Expo and launching iOS Simulator..."
echo ""
echo "This will:"
echo "  1. Start the Expo development server"
echo "  2. Open iOS Simulator"
echo "  3. Load your app"
echo ""
echo "Login credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""

npx expo start --ios
