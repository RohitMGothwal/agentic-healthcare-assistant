#!/bin/bash
# Script to push changes to GitHub

cd /Users/rohitmangalsinggothwal/Desktop/ProjectsCyber/agentic-healthcare-assistant

echo "=== Git Status ==="
git status

echo ""
echo "=== Adding all changes ==="
git add -A

echo ""
echo "=== Committing changes ==="
git commit -m "feat: Enhanced login screen and appointments management

- Improved login screen with better UI, form validation, and error handling
- Added 'Login Demo Account' button for quick access
- Completely redesigned Appointments screen with:
  - Demo appointments data
  - Filter tabs (All, Upcoming, Completed, Cancelled)
  - Create new appointment modal with form
  - Delete and Cancel appointment actions
  - Improved card design with icons
- Fixed i18n JSON duplicate keys across all language files
- Added new translation keys for appointments feature"

echo ""
echo "=== Pushing to GitHub ==="
git push origin main

echo ""
echo "=== Done! ==="
