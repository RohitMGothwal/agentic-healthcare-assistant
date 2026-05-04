#!/bin/bash
# Fix iOS Build Issues

echo "🔧 Fixing iOS build issues..."
echo ""

cd /Users/rohitmangalsinggothwal/Desktop/ProjectsCyber/agentic-healthcare-assistant/mobile

echo "1. Cleaning build cache..."
rm -rf ios/build
rm -rf ios/Pods
rm -f ios/Podfile.lock

echo "2. Clearing Metro cache..."
rm -rf node_modules/.cache

echo "3. Reinstalling pods..."
cd ios
pod install

echo ""
echo "✅ iOS build fixed!"
echo ""
echo "Now restart the app with:"
echo "  cd /Users/rohitmangalsinggothwal/Desktop/ProjectsCyber/agentic-healthcare-assistant/mobile"
echo "  npx expo start --ios"
