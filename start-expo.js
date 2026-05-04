const { execSync } = require('child_process');
const path = require('path');

const mobilePath = path.join(__dirname, 'mobile');
console.log('Starting Expo from:', mobilePath);

try {
  execSync('npx expo start --ios', {
    cwd: mobilePath,
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error starting Expo:', error.message);
  process.exit(1);
}
