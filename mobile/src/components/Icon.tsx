// Icon wrapper for React Native Vector Icons
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

import RNIonicons from 'react-native-vector-icons/Ionicons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function Ionicons({ name, size = 24, color = '#000', style }: IconProps) {
  return <RNIonicons name={name} size={size} color={color} style={style} />;
}

export default { Ionicons };
