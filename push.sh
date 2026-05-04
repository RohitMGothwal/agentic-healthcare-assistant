#!/bin/bash
cd /Users/rohitmangalsinggothwal/Desktop/ProjectsCyber/agentic-healthcare-assistant

echo "Adding changes..."
git add -A

echo "Committing..."
git commit -m "fix: Dashboard StyleSheet syntax error"

echo "Pushing to GitHub..."
git push origin main

echo "Done!"
