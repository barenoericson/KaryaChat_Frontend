import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  Dimensions, StatusBar
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const mascotScale = useRef(new Animated.Value(0.2)).current;
  const mascotOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeSlide = useRef(new Animated.Value(-20)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Rings appear
      Animated.stagger(150, [
        Animated.timing(ring1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ring2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ring3Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Glow + mascot
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(glowScale, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.spring(mascotScale, { toValue: 1, friction: 4, tension: 45, useNativeDriver: true }),
        Animated.timing(mascotOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // Badge slides in
      Animated.parallel([
        Animated.timing(badgeOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(badgeSlide, { toValue: 0, friction: 6, useNativeDriver: true }),
      ]),
      // Text
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(textSlide, { toValue: 0, friction: 6, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(1000),
    ]).start(() => onFinish());

    // Continuous glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.2, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080818" />

      {/* Rings */}
      <Animated.View style={[styles.ring, styles.ring1, { opacity: ring1Opacity }]} />
      <Animated.View style={[styles.ring, styles.ring2, { opacity: ring2Opacity }]} />
      <Animated.View style={[styles.ring, styles.ring3, { opacity: ring3Opacity }]} />

      {/* Glow blob */}
      <Animated.View style={[
        styles.glowBlob,
        { opacity: glowOpacity, transform: [{ scale: glowPulse }] }
      ]} />
      <Animated.View style={[
        styles.glowBlobInner,
        { opacity: glowOpacity, transform: [{ scale: glowScale }] }
      ]} />

      {/* Badge */}
      <Animated.View style={[
        styles.badge,
        { opacity: badgeOpacity, transform: [{ translateY: badgeSlide }] }
      ]}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>AI Programming Tutor</Text>
      </Animated.View>

      {/* Mascot */}
      <Animated.Image
        source={require('../assets/finalkaryachatlog.png')}
        style={[
          styles.mascot,
          { opacity: mascotOpacity, transform: [{ scale: mascotScale }] }
        ]}
        resizeMode="contain"
      />

      {/* App name */}
      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textSlide }], alignItems: 'center' }}>
        <Text style={styles.appName}>KaryaChat</Text>
        <View style={styles.nameLine} />
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        How may I help you today? 🤖
      </Animated.Text>

      {/* Loader bar */}
      <Animated.View style={[styles.loaderRow, { opacity: taglineOpacity }]}>
        <View style={styles.loaderTrack}>
          <Animated.View style={styles.loaderFill} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080818',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
  },
  ring1: {
    width: width * 1.3,
    height: width * 1.3,
    borderColor: 'rgba(123,47,190,0.07)',
  },
  ring2: {
    width: width * 0.95,
    height: width * 0.95,
    borderColor: 'rgba(123,47,190,0.11)',
  },
  ring3: {
    width: width * 0.65,
    height: width * 0.65,
    borderColor: 'rgba(147,112,219,0.16)',
  },
  glowBlob: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(75,0,130,0.22)',
    top: height * 0.15,
  },
  glowBlobInner: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(123,47,190,0.28)',
    top: height * 0.22,
  },
  badge: {
    position: 'absolute',
    top: height * 0.1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(123,47,190,0.18)',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 7,
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(147,112,219,0.35)',
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#9B59B6',
  },
  badgeText: {
    color: '#D7B4F3',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  mascot: {
    width: width * 0.72,
    height: width * 0.72,
    marginBottom: 4,
  },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 6,
  },
  nameLine: {
    width: 60,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#7B2FBE',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: '#C9A0DC',
    letterSpacing: 0.3,
    marginBottom: 36,
  },
  loaderRow: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  loaderTrack: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(147,112,219,0.2)',
    overflow: 'hidden',
  },
  loaderFill: {
    width: '60%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#7B2FBE',
  },
});