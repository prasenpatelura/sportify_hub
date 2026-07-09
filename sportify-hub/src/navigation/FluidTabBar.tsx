import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Explore: { active: 'search', inactive: 'search-outline' },
  Play: { active: 'football', inactive: 'football-outline' },
  Activity: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const H_PADDING = 8;

export default function FluidTabBar({ state, navigation }: any) {
  const [containerWidth, setContainerWidth] = useState(0);
  const tabWidth = containerWidth / state.routes.length;

  const indicatorX = useRef(new Animated.Value(0)).current;
  const iconScales = useRef(state.routes.map((_: any, i: number) => new Animated.Value(i === state.index ? 1 : 0))).current;

  useEffect(() => {
    if (!containerWidth) return;
    Animated.spring(indicatorX, {
      toValue: state.index * tabWidth + H_PADDING,
      useNativeDriver: true,
      friction: 8,
      tension: 70,
    }).start();

    iconScales.forEach((val: Animated.Value, i: number) => {
      Animated.spring(val, {
        toValue: i === state.index ? 1 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 80,
      }).start();
    });
  }, [state.index, containerWidth]);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.container} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.borderOverlay} />

        {containerWidth > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: tabWidth - H_PADDING * 2,
                transform: [{ translateX: indicatorX }],
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const icons = ICONS[route.name] || ICONS.Home;
          const scale = iconScales[index];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityLabel={route.name}
              accessibilityState={{ selected: isFocused }}
            >
              <Animated.View
                style={{
                  transform: [
                    { scale: scale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
                    { translateY: scale.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
                  ],
                }}
              >
                <Ionicons
                  name={isFocused ? icons.active : icons.inactive}
                  size={22}
                  color={isFocused ? '#fff' : colors.textMuted}
                />
              </Animated.View>
              <Animated.Text
                style={[
                  styles.label,
                  {
                    opacity: scale,
                    color: '#fff',
                  },
                ]}
                numberOfLines={1}
              >
                {route.name}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 30 : 16,
  },
  container: {
    flexDirection: 'row',
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(10,10,10,0.55)',
    elevation: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  indicator: {
    position: 'absolute',
    top: H_PADDING,
    bottom: H_PADDING,
    left: 0,
    borderRadius: 24,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    height: 14,
  },
});
