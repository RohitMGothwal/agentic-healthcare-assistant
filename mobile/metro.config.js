const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  // Add any custom config here
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
