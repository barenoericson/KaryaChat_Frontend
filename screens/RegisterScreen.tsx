import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Animated, Dimensions, StatusBar, ScrollView, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/api';
import { Colors, Typography, Spacing, Radius, Shadows, Gradients } from '../constants/theme';

const { width } = Dimensions.get('window');

type Role = 'teacher' | 'student';

const ROLE_OPTIONS: { value: Role; label: string; icon: string; desc: string }[] = [
  { value: 'teacher', label: "I'm a Teacher", icon: '👨‍🏫', desc: 'Create classes & lessons' },
  { value: 'student', label: "I'm a Student", icon: '🎓', desc: 'Join classes & learn' },
];

export default function RegisterScreen({ navigation }: any) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 45, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure both passwords are the same.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      await login(res.data.token, res.data.user);
    } catch (e: any) {
      const msg = e.response?.data?.message;
      Alert.alert('Registration Failed', Array.isArray(msg) ? msg.join('\n') : (msg || 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  const strengthLevel = Math.min(Math.floor(password.length / 3), 4);
  const strengthColor = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'][strengthLevel];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthLevel];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Purple header */}
      <LinearGradient colors={Gradients.primary} style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Image
          source={require('../assets/CodeMate_official_log-removebg-preview.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSub}>Join CodeMate and start your journey</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.card, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          {/* Role selector */}
          <Text style={styles.label}>I am a...</Text>
          <View style={styles.roleRow}>
            {ROLE_OPTIONS.map((opt) => {
              const selected = role === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.roleCard, selected && styles.roleCardSelected]}
                  onPress={() => setRole(opt.value)}
                >
                  <Text style={styles.roleIcon}>{opt.icon}</Text>
                  <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.roleDesc, selected && styles.roleDescSelected]}>
                    {opt.desc}
                  </Text>
                  {selected && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Username */}
          <Text style={styles.label}>Username</Text>
          <View style={[styles.inputWrap, focused === 'username' && styles.inputFocused]}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              placeholderTextColor={Colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              onFocus={() => setFocused('username')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.inputWrap, focused === 'email' && styles.inputFocused]}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrap, focused === 'password' && styles.inputFocused]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          {/* Strength indicator */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[styles.strengthBar, i <= strengthLevel && { backgroundColor: strengthColor }]}
                />
              ))}
              <Text style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
            </View>
          )}

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputWrap, focused === 'confirm' && styles.inputFocused]}>
            <Text style={styles.inputIcon}>🛡️</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor={Colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocused('confirm')}
              onBlur={() => setFocused(null)}
            />
            {confirmPassword.length > 0 && (
              <Text style={styles.matchIcon}>
                {confirmPassword === password ? '✅' : '❌'}
              </Text>
            )}
          </View>

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, (loading || pressed) && styles.btnPressed]}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient colors={Gradients.primary} style={styles.primaryBtnGrad}>
              {loading
                ? <ActivityIndicator color={Colors.textInverse} />
                : <Text style={styles.primaryBtnText}>Create Account</Text>}
            </LinearGradient>
          </Pressable>

          {/* Login link */}
          <Pressable
            style={({ pressed }) => [styles.loginLink, pressed && { opacity: 0.6 }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkBold}>Log In</Text>
            </Text>
          </Pressable>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: Spacing.screenH,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: Spacing.screenH,
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 20, color: Colors.textInverse },
  logo: { width: 130, height: 68, marginBottom: 10 },
  headerTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size['2xl'],
    color: Colors.textInverse,
    marginBottom: 4,
  },
  headerSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.primarySoft,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.screenH, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius['2xl'],
    padding: Spacing['6'],
    ...Shadows.md,
  },

  label: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  roleRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing['5'] },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    backgroundColor: Colors.background,
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  roleIcon: { fontSize: 26, marginBottom: 6 },
  roleLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 3,
  },
  roleLabelSelected: { color: Colors.primary },
  roleDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  roleDescSelected: { color: Colors.primaryMid },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: { color: Colors.textInverse, fontSize: 10, fontWeight: '700' },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing['4'],
    marginBottom: Spacing['4'],
    height: 52,
    gap: 10,
  },
  inputFocused: { borderColor: Colors.borderFocus, backgroundColor: Colors.primarySoft },
  inputIcon: { fontSize: 16 },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    height: '100%',
  },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 16 },
  matchIcon: { fontSize: 16 },

  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -Spacing['3'],
    marginBottom: Spacing['4'],
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  strengthLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    minWidth: 36,
  },

  primaryBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: Spacing['4'],
  },
  primaryBtnGrad: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  primaryBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textInverse,
  },
  btnPressed: { opacity: 0.75 },

  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginLinkText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  loginLinkBold: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
});
