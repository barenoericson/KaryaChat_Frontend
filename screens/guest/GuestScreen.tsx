import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal,
  Animated, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import ChatScreen from '../shared/ChatScreen';
import { Typography } from '../../constants/theme';

type NavProp = StackNavigationProp<AuthStackParamList, 'Guest'>;

export default function GuestScreen() {
  const navigation = useNavigation<NavProp>();
  const [showChat, setShowChat]           = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const fadeIn    = useRef(new Animated.Value(0)).current;
  const slideUp   = useRef(new Animated.Value(24)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2300, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue:  0, duration: 2300, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  /* ─── Chat view (screen 27) ─────────────────────────────── */
  if (showChat) {
    return (
      <View style={{ flex: 1 }}>
        <ChatScreen
          mode="guest"
          title="Ask CodeMate"
          subtitle="2 free messages"
          onBack={() => setShowChat(false)}
          onLimitReached={() => setShowLimitModal(true)}
        />

        <Modal
          visible={showLimitModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLimitModal(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <View style={styles.modalIconWrap}>
                <MaterialIcons name="lock" size={28} color="#7C3AED" />
              </View>
              <Text style={styles.modalTitle}>That was your last free message</Text>
              <Text style={styles.modalDesc}>
                Register to keep learning with unlimited AI help
              </Text>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                onPress={() => navigation.navigate('Register')}
              >
                <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.primaryGrad}>
                  <Text style={styles.primaryBtnText}>Create free account</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.ghostLink, pressed && styles.pressed]}
                onPress={() => setShowLimitModal(false)}
              >
                <Text style={styles.ghostLinkText}>Maybe later</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  /* ─── Home / intro view (screen 26) ─────────────────────── */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top header */}
      <View style={styles.header}>
        <View style={styles.wordmarkRow}>
          <Image
            source={require('../../assets/CodeMate_AI_Icon.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.wordmark}>CodeMate</Text>
        </View>
        <View style={styles.guestBadge}>
          <Text style={styles.guestBadgeText}>Guest</Text>
        </View>
      </View>

      {/* Mascot card */}
      <Animated.View style={[styles.mascotCard, { opacity: fadeIn }]}>
        <LinearGradient colors={['#EEE7FF', '#F6F3FF']} style={styles.mascotGrad}>
          <Animated.Image
            source={require('../../assets/CodeMate_AI_Icon.png')}
            style={[styles.mascot, { transform: [{ translateY: floatAnim }] }]}
            resizeMode="contain"
          />
        </LinearGradient>
      </Animated.View>

      {/* Headline + subtext */}
      <Animated.View style={[styles.textBlock, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
        <Text style={styles.headline}>Try the AI tutor,{'\n'}free</Text>
        <Text style={styles.subtext}>
          Ask 2 programming questions —{'\n'}no account needed.
        </Text>
      </Animated.View>

      {/* Amber pill */}
      <Animated.View style={[styles.pillWrap, { opacity: fadeIn }]}>
        <View style={styles.pill}>
          <MaterialIcons name="bolt" size={15} color="#92400E" />
          <Text style={styles.pillText}>2 free messages left</Text>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[styles.btnWrap, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
        <Pressable
          style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
          onPress={() => setShowChat(true)}
        >
          <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.startGrad}>
            <MaterialIcons name="chat" size={18} color="#FFFFFF" />
            <Text style={styles.startBtnText}>Start chatting</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.createLink, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.createLinkText}>Create free account</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 10,
  },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo: { width: 28, height: 28 },
  wordmark: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 18,
    color: '#1A1033',
    letterSpacing: -0.4,
  },
  guestBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F3EEFF',
    borderWidth: 1,
    borderColor: '#D9CEF7',
  },
  guestBadgeText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#7C3AED',
  },

  /* Mascot card */
  mascotCard: {
    marginHorizontal: 22,
    marginTop: 16,
    marginBottom: 28,
    borderRadius: 26,
    overflow: 'hidden',
  },
  mascotGrad: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: { width: 160, height: 160 },

  /* Text */
  textBlock: { alignItems: 'center', paddingHorizontal: 22, marginBottom: 20 },
  headline: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 28,
    color: '#1A1033',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 10,
  },
  subtext: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13.5,
    color: '#6E6788',
    textAlign: 'center',
    lineHeight: 21,
  },

  /* Amber pill */
  pillWrap: { alignItems: 'center', marginBottom: 28 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#92400E',
  },

  /* Buttons */
  btnWrap: { paddingHorizontal: 22, gap: 14 },
  startBtn: { borderRadius: 15, overflow: 'hidden' },
  startGrad: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
  },
  startBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  createLink: { alignItems: 'center', paddingVertical: 6 },
  createLinkText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 13.5,
    color: '#7C3AED',
  },

  /* Limit modal */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#F3EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 18,
    color: '#1A1033',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDesc: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13.5,
    color: '#6E6788',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryBtn: { width: '100%', borderRadius: 15, overflow: 'hidden', marginBottom: 10 },
  primaryGrad: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  primaryBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  ghostLink: { paddingVertical: 8 },
  ghostLinkText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    color: '#A99BCF',
  },

  pressed: { opacity: 0.75 },
});
