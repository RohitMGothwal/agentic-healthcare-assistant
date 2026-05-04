// Icon wrapper that works with both Expo and bare React Native
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

let VectorIcons: any = null;
let ExpoIonicons: any = null;
let RNIonicons: any = null;

// Try to load expo-vector-icons first (for Expo builds)
try {
  const expoIcons = require('@expo/vector-icons');
  if (expoIcons && expoIcons.Ionicons) {
    ExpoIonicons = expoIcons.Ionicons;
    VectorIcons = expoIcons;
  }
} catch (e) {
  console.log('expo-vector-icons not available, trying react-native-vector-icons');
}

// Fallback to react-native-vector-icons (for bare RN builds)
if (!ExpoIonicons) {
  try {
    RNIonicons = require('react-native-vector-icons/Ionicons').default;
    if (RNIonicons) {
      VectorIcons = { Ionicons: RNIonicons };
    }
  } catch (e2) {
    console.warn('No vector icons library available');
  }
}

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function Ionicons({ name, size = 24, color = '#000', style }: IconProps) {
  // Use Expo icons if available
  if (ExpoIonicons) {
    return <ExpoIonicons name={name} size={size} color={color} style={style} />;
  }

  // Use React Native Vector Icons if available
  if (RNIonicons) {
    return <RNIonicons name={name} size={size} color={color} style={style} />;
  }

  // Fallback: show a simple text representation
  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <Text style={{ fontSize: size * 0.5, color }}>●</Text>
    </View>
  );
}

export default { Ionicons };
