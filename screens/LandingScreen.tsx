import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  Animated, StatusBar, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Typography } from '../constants/theme';

export default function LandingScreen({ navigation }: any) {
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(32)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: -8, duration: 2400, useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue:  0, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Illustration well */}
        <Animated.View style={[styles.illustrationWell, { opacity: fadeIn }]}>
          <LinearGradient
            colors={['#EEE7FF', '#F6F3FF']}
            style={styles.illustrationGrad}
          >
            <Animated.Image
              source={require('../assets/CodeMate_official_log-removebg-preview.png')}
              style={[styles.mascot, { transform: [{ translateY: logoFloat }] }]}
              resizeMode="contain"
            />
          </LinearGradient>
        </Animated.View>

        {/* Headline */}
        <Animated.View style={[styles.textBlock, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <Text style={styles.headline}>Welcome to CodeMate</Text>
          <Text style={styles.subtext}>
            Your AI tutor, live code playground,{'\n'}and classroom — all in one app.
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.buttons, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          {/* Log In — primary */}
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Login')}
          >
            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.primaryGrad}>
              <Text style={styles.primaryBtnText}>Log In</Text>
            </LinearGradient>
          </Pressable>

          {/* Create account — outline */}
          <Pressable
            style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.outlineBtnText}>Create account</Text>
          </Pressable>

          {/* Guest — ghost */}
          <Pressable
            style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Guest')}
          >
            <Text style={styles.ghostBtnText}>Continue as guest</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#4A4368" />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },

  illustrationWell: {
    width: '100%',
    marginTop: 48,
    marginBottom: 32,
    borderRadius: 26,
    overflow: 'hidden',
  },
  illustrationGrad: {
    height: 226,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: 170,
    height: 170,
  },

  textBlock: { alignItems: 'center', marginBottom: 36 },
  headline: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 24,
    color: '#1A1033',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtext: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    color: '#6E6788',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 210,
  },

  buttons: { width: '100%', gap: 12 },

  primaryBtn: { borderRadius: 15, overflow: 'hidden' },
  primaryGrad: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.30,
    shadowRadius: 22,
    elevation: 6,
  },
  primaryBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },

  outlineBtn: {
    height: 50,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#D9CEF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 15,
    color: '#5B21B6',
  },

  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  ghostBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    color: '#4A4368',
  },

  pressed: { opacity: 0.78 },
});
