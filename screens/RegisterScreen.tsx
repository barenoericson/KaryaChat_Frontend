import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Animated, Dimensions, StatusBar, ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/api';

const { width } = Dimensions.get('window');

// SVG Icons
const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#C9A0DC" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EmailIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6l-10 7L2 6" stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LockIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 11V7a5 5 0 0110 0v4" stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ShieldIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    {visible ? (
      <>
        <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M1 1l22 22" stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <>
        <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={12} cy={12} r={3} stroke="#7B5EA7" strokeWidth={2} />
      </>
    )}
  </Svg>
);

const ArrowIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const getStrengthColor = (len: number) => {
  if (len < 6) return '#E74C3C';
  if (len < 9) return '#F39C12';
  if (len < 12) return '#2ECC71';
  return '#9B59B6';
};

const getStrengthLabel = (len: number) => {
  if (len === 0) return '';
  if (len < 6) return 'Weak';
  if (len < 9) return 'Fair';
  if (len < 12) return 'Good';
  return 'Strong';
};

export default function RegisterScreen({ navigation }: any) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const mascotBounce = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotBounce, { toValue: -10, duration: 2200, useNativeDriver: true }),
        Animated.timing(mascotBounce, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.2, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Oops!', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch!', 'Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/register`, { username, email, password });
      await login(res.data.token, res.data.user);
    } catch (e: any) {
      Alert.alert('Registration Failed', e.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const strengthColor = getStrengthColor(password.length);
  const strengthLabel = getStrengthLabel(password.length);
  const strengthBars = Math.min(Math.floor(password.length / 3), 4);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#080818" />
      <View style={styles.ring1} />
      <View style={styles.ring2} />
      <Animated.View style={[styles.glowBlob, { transform: [{ scale: glowPulse }] }]} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar: back left, mascot center */}
        <Animated.View style={[styles.topBar, { opacity: fadeIn }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <Animated.Image
            source={require('../assets/finalkaryachatlog.png')}
            style={[styles.mascot, { transform: [{ translateY: mascotBounce }] }]}
            resizeMode="contain"
          />
          <View style={styles.backBtnSpacer} />
        </Animated.View>

        {/* Form card */}
        <Animated.View style={[
          styles.card,
          { opacity: fadeIn, transform: [{ translateY: slideUp }] }
        ]}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join KaryaChat and start learning to code</Text>

          {/* Username */}
          <Text style={styles.label}>Username</Text>
          <View style={[styles.inputWrap, focusedField === 'username' && styles.inputWrapFocused]}>
            <UserIcon />
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              placeholderTextColor="#3D2E5A"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.inputWrap, focusedField === 'email' && styles.inputWrapFocused]}>
            <EmailIcon />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#3D2E5A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrap, focusedField === 'password' && styles.inputWrapFocused]}>
            <LockIcon />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#3D2E5A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <EyeIcon visible={showPassword} />
            </TouchableOpacity>
          </View>

          {/* Password strength */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              {[1, 2, 3, 4].map(i => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    i <= strengthBars && { backgroundColor: strengthColor }
                  ]}
                />
              ))}
              <Text style={[styles.strengthLabel, { color: strengthColor }]}>
                {strengthLabel}
              </Text>
            </View>
          )}

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputWrap, focusedField === 'confirm' && styles.inputWrapFocused]}>
            <ShieldIcon />
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor="#3D2E5A"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
            />
            {confirmPassword.length > 0 && (
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                {confirmPassword === password ? (
                  <Path d="M20 6L9 17l-5-5" stroke="#2ECC71" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <Path d="M18 6L6 18M6 6l12 12" stroke="#E74C3C" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                )}
              </Svg>
            )}
          </View>

          {/* Register button */}
          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnInner}>
                <Text style={styles.registerBtnText}>Create My Account</Text>
                <ArrowIcon />
              </View>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080818' },
  scroll: { alignItems: 'center', paddingBottom: 40 },
  ring1: {
    position: 'absolute', width: width * 1.2, height: width * 1.2,
    borderRadius: width * 0.6, borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.07)', top: -width * 0.4,
  },
  ring2: {
    position: 'absolute', width: width * 0.7, height: width * 0.7,
    borderRadius: width * 0.35, borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.12)', top: -width * 0.1,
  },
  glowBlob: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(75,0,130,0.18)', top: 40,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    marginBottom: 4,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: 'rgba(123,47,190,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(147,112,219,0.2)',
  },
  backBtnSpacer: { width: 42 },
  mascot: {
    width: width * 0.38,
    height: width * 0.38,
  },
  card: {
    width: width - 32,
    backgroundColor: '#0E0E28',
    borderRadius: 28, padding: 24,
    marginTop: 12, borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.2)',
  },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#7B5EA7', marginBottom: 22, fontWeight: '500', lineHeight: 18 },
  label: {
    fontSize: 11, color: '#9B7EC8', fontWeight: '700',
    letterSpacing: 0.8, marginBottom: 7, textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13132A', borderRadius: 14,
    paddingHorizontal: 14, marginBottom: 14,
    borderWidth: 1.5, borderColor: 'rgba(123,47,190,0.15)', gap: 10,
  },
  inputWrapFocused: { borderColor: '#7B2FBE', backgroundColor: '#16163A' },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  strengthRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 5, marginTop: -8, marginBottom: 14,
  },
  strengthBar: {
    flex: 1, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(123,47,190,0.15)',
  },
  strengthLabel: { fontSize: 11, fontWeight: '700', minWidth: 42 },
  registerBtn: {
    backgroundColor: '#7B2FBE', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 6,
    shadowColor: '#7B2FBE', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 16, elevation: 10,
  },
  btnDisabled: { opacity: 0.7 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  loginLink: { marginTop: 16, alignItems: 'center' },
  loginLinkText: { color: '#7B5EA7', fontSize: 14 },
  loginLinkBold: { color: '#C9A0DC', fontWeight: '800' },
});