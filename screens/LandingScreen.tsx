import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  Animated, Dimensions, StatusBar, Image, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows, Gradients } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Tutor', desc: 'Get instant help from CodeMate AI' },
  { icon: '📚', title: 'Structured Lessons', desc: 'Learn through teacher-curated content' },
  { icon: '🏆', title: 'Practice Quizzes', desc: 'Test your skills and track progress' },
];

export default function LandingScreen({ navigation }: any) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(60)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: -10, duration: 2400, useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Purple hero area */}
      <LinearGradient colors={Gradients.primary} style={styles.hero}>
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: logoFloat }] }}>
          <Image
            source={require('../assets/CodeMate_official_log-removebg-preview.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.Text style={[styles.heroTitle, { opacity: fadeIn }]}>
          Learn to Code Smarter
        </Animated.Text>
        <Animated.Text style={[styles.heroSub, { opacity: fadeIn }]}>
          AI-powered lessons, quizzes, and a tutor{'\n'}that's always there for you
        </Animated.Text>
      </LinearGradient>

      {/* White bottom sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideUp }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>

          {/* Feature pills */}
          <View style={styles.featureRow}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[{ val: '50+', label: 'Lessons' }, { val: '10+', label: 'Courses' }, { val: '24/7', label: 'AI Support' }].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* CTA buttons */}
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Register')}
          >
            <LinearGradient colors={Gradients.primary} style={styles.primaryBtnGrad}>
              <Text style={styles.primaryBtnText}>Get Started  →</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryBtnText}>Already have an account? Log In</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Guest')}
          >
            <Text style={styles.ghostBtnText}>Explore as Guest</Text>
          </Pressable>

        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDark },

  hero: {
    height: height * 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingHorizontal: Spacing.screenH,
  },
  logo: { width: 160, height: 100, marginBottom: 8 },
  heroTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size['3xl'],
    color: Colors.textInverse,
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.primarySoft,
    textAlign: 'center',
    lineHeight: Typography.size.sm * Typography.lineHeight.relaxed,
  },

  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    marginTop: -Radius['2xl'],
    ...Shadows.lg,
  },
  sheetContent: {
    paddingHorizontal: Spacing.screenH,
    paddingTop: Spacing['6'],
    paddingBottom: Spacing['10'],
  },

  featureRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing['6'],
  },
  featureCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  featureIcon: { fontSize: 22, marginBottom: 6 },
  featureTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 3,
  },
  featureDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.lg,
    paddingVertical: Spacing['4'],
    marginBottom: Spacing['6'],
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xl,
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  primaryBtn: { borderRadius: Radius.full, overflow: 'hidden', marginBottom: 12 },
  primaryBtnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: Radius.full,
  },
  primaryBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },

  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },

  ghostBtn: { paddingVertical: 12, alignItems: 'center' },
  ghostBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },

  pressed: { opacity: 0.8 },
});
