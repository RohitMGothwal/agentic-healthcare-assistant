import subprocess
import os

os.chdir('/Users/rohitmangalsinggothwal/Desktop/ProjectsCyber/agentic-healthcare-assistant')

print("=== Git Status ===")
result = subprocess.run(['git', 'status'], capture_output=True, text=True)
print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)

print("\n=== Adding all changes ===")
result = subprocess.run(['git', 'add', '-A'], capture_output=True, text=True)
print("Done")
if result.stderr:
    print("STDERR:", result.stderr)

print("\n=== Committing changes ===")
result = subprocess.run([
    'git', 'commit', '-m', 
    'feat: Enhanced login screen and appointments management\n\n- Improved login screen with better UI, form validation, and error handling\n- Added Login Demo Account button for quick access\n- Completely redesigned Appointments screen with demo data, filters, create/delete functionality\n- Fixed i18n JSON duplicate keys across all language files'
], capture_output=True, text=True)
print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)

print("\n=== Pushing to GitHub ===")
result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)

print("\n=== Done! ===")
