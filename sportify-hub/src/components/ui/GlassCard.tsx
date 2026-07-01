import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const PADDING_PROPS = new Set([
  'padding', 'paddingHorizontal', 'paddingVertical',
  'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
  'paddingStart', 'paddingEnd',
]);

export default function GlassCard({ children, style }: GlassCardProps) {
  const containerStyle: ViewStyle = {};
  const innerPadding: ViewStyle = {};
  let hasPadding = false;

  if (style) {
    for (const [key, value] of Object.entries(style)) {
      if (PADDING_PROPS.has(key)) {
        (innerPadding as any)[key] = value;
        hasPadding = true;
      } else {
        (containerStyle as any)[key] = value;
      }
    }
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <BlurView
        intensity={50}
        tint="dark"
        style={[styles.blur, hasPadding ? innerPadding : styles.defaultPadding]}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  blur: {
    flex: 1,
  },
  defaultPadding: {
    padding: 16,
  },
});
