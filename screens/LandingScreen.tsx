import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, StatusBar, ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }: any) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(80)).current;
  const mascotFloat = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;
  const card1 = useRef(new Animated.Value(0)).current;
  const card2 = useRef(new Animated.Value(0)).current;
  const card3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.stagger(120, [
      Animated.spring(card1, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(card2, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(card3, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotFloat, { toValue: -16, duration: 2200, useNativeDriver: true }),
        Animated.timing(mascotFloat, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.25, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const featureCards = [
    { icon: '🤖', title: 'Chat with\nKarya AI', subtitle: 'Get instant help', color: '#7B2FBE', textColor: '#fff' },
    { icon: '📚', title: 'Courses', subtitle: 'Structured learning', color: '#9B59B6', textColor: '#fff' },
    { icon: '📝', title: 'Assessments', subtitle: 'Test your skills', color: '#1A1A35', textColor: '#C9A0DC', border: true },
  ];

  const cardAnims = [card1, card2, card3];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080818" />

      {/* Background */}
      <View style={styles.ring1} />
      <View style={styles.ring2} />
      <Animated.View style={[styles.glowBlob, { transform: [{ scale: glowPulse }] }]} />

      {/* Top bar */}
      <Animated.View style={[styles.topBar, { opacity: fadeIn }]}>
        <View>
          <Text style={styles.appName}>KaryaChat</Text>
          <Text style={styles.appSub}>AI Programming Tutor</Text>
        </View>
        <View style={styles.onlinePill}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </Animated.View>

      {/* Mascot area */}
      <Animated.Image
        source={require('../assets/finalkaryachatlog.png')}
        style={[
          styles.mascot,
          { opacity: fadeIn, transform: [{ translateY: mascotFloat }] }
        ]}
        resizeMode="contain"
      />

      {/* Bottom sheet */}
      <Animated.View style={[
        styles.sheet,
        { opacity: fadeIn, transform: [{ translateY: slideUp }] }
      ]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Greeting */}
          <Text style={styles.greeting}>Hi there! 👋</Text>
          <Text style={styles.headline}>How may I help{'\n'}you today?</Text>

          {/* Feature cards */}
          <View style={styles.cardsGrid}>
            {/* Big card */}
            <Animated.View style={[
              styles.bigCardWrap,
              { opacity: card1, transform: [{ scale: card1 }] }
            ]}>
              <TouchableOpacity
                style={styles.bigCard}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.85}
              >
                <View style={styles.bigCardContent}>
                  <Text style={styles.bigCardIcon}>🤖</Text>
                  <View>
                    <Text style={styles.bigCardTitle}>Chat with Karya</Text>
                    <Text style={styles.bigCardSub}>Your AI coding buddy</Text>
                  </View>
                </View>
                <Text style={styles.cardArrow}>↗</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Small cards row */}
            <View style={styles.smallCardsRow}>
              {[
                { icon: '📚', label: 'Courses', anim: card2 },
                { icon: '📝', label: 'Quizzes', anim: card3 },
              ].map((c) => (
                <Animated.View
                  key={c.label}
                  style={[
                    styles.smallCardWrap,
                    { opacity: c.anim, transform: [{ scale: c.anim }] }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.smallCard}
                    onPress={() => navigation.navigate('Register')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.smallCardIcon}>{c.icon}</Text>
                    <Text style={styles.smallCardLabel}>{c.label}</Text>
                    <Text style={styles.cardArrow}>↗</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { val: '50+', label: 'Lessons' },
              { val: '10+', label: 'Courses' },
              { val: '24/7', label: 'AI Support' },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Get Started  →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080818', alignItems: 'center' },
  ring1: {
    position: 'absolute',
    width: width * 1.2, height: width * 1.2,
    borderRadius: width * 0.6,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.07)',
    top: -width * 0.35,
  },
  ring2: {
    position: 'absolute',
    width: width * 0.8, height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.12)',
    top: -width * 0.12,
  },
  glowBlob: {
    position: 'absolute',
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(75,0,130,0.2)',
    top: height * 0.06,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 52,
    marginBottom: 4,
  },
  appName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  appSub: { fontSize: 11, color: '#9B59B6', fontWeight: '600', letterSpacing: 0.5 },
  onlinePill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(123,47,190,0.15)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    gap: 5, borderWidth: 1, borderColor: 'rgba(147,112,219,0.25)',
  },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#7CFC00' },
  onlineText: { color: '#C9A0DC', fontSize: 11, fontWeight: '600' },
  mascot: {
    width: width * 0.62,
    height: width * 0.62,
    marginTop: 4,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#0E0E28',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: 'rgba(123,47,190,0.2)',
    maxHeight: height * 0.62,
  },
  greeting: {
    fontSize: 13, color: '#9B59B6',
    fontWeight: '700', letterSpacing: 0.5, marginBottom: 4,
  },
  headline: {
    fontSize: 26, fontWeight: '900',
    color: '#fff', lineHeight: 33, marginBottom: 18,
  },
  cardsGrid: { gap: 10, marginBottom: 16 },
  bigCardWrap: { width: '100%' },
  bigCard: {
    backgroundColor: '#7B2FBE',
    borderRadius: 20, padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#7B2FBE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  bigCardContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bigCardIcon: { fontSize: 32 },
  bigCardTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  bigCardSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  cardArrow: { fontSize: 18, color: 'rgba(255,255,255,0.5)' },
  smallCardsRow: { flexDirection: 'row', gap: 10 },
  smallCardWrap: { flex: 1 },
  smallCard: {
    backgroundColor: '#1A1A35',
    borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    gap: 8, borderWidth: 1,
    borderColor: 'rgba(147,112,219,0.2)',
  },
  smallCardIcon: { fontSize: 22 },
  smallCardLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#fff' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(123,47,190,0.1)',
    borderRadius: 16, padding: 14,
    marginBottom: 16, borderWidth: 1,
    borderColor: 'rgba(147,112,219,0.15)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 11, color: '#C9A0DC', marginTop: 2, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#7B2FBE',
    borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginBottom: 12,
    shadowColor: '#7B2FBE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 16, elevation: 10,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  secondaryBtn: {
    borderRadius: 16, paddingVertical: 13,
    alignItems: 'center', borderWidth: 1,
    borderColor: 'rgba(147,112,219,0.3)',
  },
  secondaryBtnText: { color: '#C9A0DC', fontSize: 14, fontWeight: '600' },
});