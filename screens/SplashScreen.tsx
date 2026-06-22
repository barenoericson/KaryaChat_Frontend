import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../constants/theme';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0.82)).current;
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const dotsOpacity  = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];
  const dotsScale = [
    useRef(new Animated.Value(0.8)).current,
    useRef(new Animated.Value(0.8)).current,
    useRef(new Animated.Value(0.8)).current,
  ];

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(1400),
    ]).start(() => onFinish());

    dotsOpacity.forEach((dot, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.parallel([
            Animated.timing(dot,            { toValue: 1,   duration: 400, useNativeDriver: true }),
            Animated.timing(dotsScale[i],   { toValue: 1,   duration: 400, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(dot,            { toValue: 0.3, duration: 400, useNativeDriver: true }),
            Animated.timing(dotsScale[i],   { toValue: 0.8, duration: 400, useNativeDriver: true }),
          ]),
          Animated.delay((2 - i) * 200),
        ])
      ).start();
    });
  }, []);

  return (
    <LinearGradient
      colors={['#8B49F0', '#5B21B6', '#42168A']}
      locations={[0, 0.6, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#8B49F0" />

      <View style={styles.content}>
        {/* Glass logo tile */}
        <Animated.View style={[styles.logoTile, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Image
            source={require('../assets/CodeMate_AI_Icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Wordmark + tagline */}
        <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
          <Text style={styles.wordmark}>CodeMate</Text>
          <Text style={styles.tagline}>Learn to code, with AI by your side</Text>
        </Animated.View>
      </View>

      {/* Pulsing dots */}
      <View style={styles.dotsRow}>
        {dotsOpacity.map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { opacity: dot, transform: [{ scale: dotsScale[i] }] }]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  content: { alignItems: 'center' },

  logoTile: {
    width: 160,
    height: 160,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: { width: 120, height: 120 },

  wordmark: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 30,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12.5,
    color: '#E3D7FB',
    letterSpacing: 0.2,
  },

  dotsRow: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});
