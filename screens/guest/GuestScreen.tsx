import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import ChatScreen from '../shared/ChatScreen';
import { Colors, Typography, Spacing, Radius, Gradients, Shadows } from '../../constants/theme';

type NavProp = StackNavigationProp<AuthStackParamList, 'Guest'>;

export default function GuestScreen() {
  const navigation = useNavigation<NavProp>();
  const [showLimitModal, setShowLimitModal] = useState(false);

  return (
    <View style={styles.container}>
      <ChatScreen
        mode="guest"
        title="CodeMate AI"
        subtitle="Try 2 free messages"
        onBack={() => navigation.goBack()}
        onLimitReached={() => setShowLimitModal(true)}
      />

      {/* Limit reached modal */}
      <Modal
        visible={showLimitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLimitModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalEmoji}>🚀</Text>
            <Text style={styles.modalTitle}>You've reached the limit!</Text>
            <Text style={styles.modalDesc}>
              Create a free account to unlock unlimited AI tutoring, classes, and quizzes.
            </Text>

            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.8 }]}
              onPress={() => navigation.navigate('Register')}
            >
              <LinearGradient colors={Gradients.primary} style={styles.primaryBtnGrad}>
                <Text style={styles.primaryBtnText}>Create Free Account</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.7 }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.secondaryBtnText}>I already have an account</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.6 }]}
              onPress={() => setShowLimitModal(false)}
            >
              <Text style={styles.ghostBtnText}>Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenH,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: Radius['2xl'],
    padding: Spacing['8'],
    width: '100%',
    alignItems: 'center',
    ...Shadows.lg,
  },
  modalEmoji: { fontSize: 44, marginBottom: 12 },
  modalTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size['2xl'],
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },

  primaryBtn: {
    width: '100%',
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: 12,
  },
  primaryBtnGrad: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textInverse,
  },

  secondaryBtn: {
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  secondaryBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.primary,
  },

  ghostBtn: { paddingVertical: 10 },
  ghostBtnText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
});
