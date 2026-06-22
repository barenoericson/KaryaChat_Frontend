import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Animated, StatusBar, ScrollView, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/api';
import { Typography } from '../constants/theme';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 45, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      });
      await login(res.data.token, res.data.user);
    } catch (e: any) {
      const msg = e.response?.data?.message;
      Alert.alert('Login Failed', Array.isArray(msg) ? msg.join('\n') : (msg || 'Invalid credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color="#1A1033" />
        </Pressable>

        {/* Mascot */}
        <Animated.View style={[styles.mascotWrap, { opacity: fadeIn }]}>
          <Image
            source={require('../assets/CodeMate_official_log-removebg-preview.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.titleBlock, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue learning</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          {/* Email */}
          <View style={[styles.field, focused === 'email' && styles.fieldFocused]}>
            <MaterialIcons name="mail-outline" size={18} color={focused === 'email' ? '#7C3AED' : '#A99BCF'} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A99BCF"
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
          <View style={[styles.field, focused === 'password' && styles.fieldFocused]}>
            <MaterialIcons name="lock-outline" size={18} color={focused === 'password' ? '#7C3AED' : '#A99BCF'} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A99BCF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />
            <Pressable onPress={() => setShowPwd(!showPwd)} hitSlop={8}>
              <MaterialIcons
                name={showPwd ? 'visibility' : 'visibility-off'}
                size={18}
                color="#A99BCF"
              />
            </Pressable>
          </View>

          {/* Forgot password */}
          <Pressable style={styles.forgotWrap} onPress={() => Alert.alert('Reset Password', 'Contact your admin to reset your password.')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {/* Log In button */}
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, (loading || pressed) && styles.pressed]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.primaryGrad}>
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.primaryBtnText}>Log In</Text>}
            </LinearGradient>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons (UI only) */}
          <View style={styles.socialRow}>
            <Pressable
              style={({ pressed }) => [styles.socialBtn, pressed && styles.pressed]}
              onPress={() => Alert.alert('Coming soon', 'Google login is not available yet.')}
            >
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.socialBtn, pressed && styles.pressed]}
              onPress={() => Alert.alert('Coming soon', 'GitHub login is not available yet.')}
            >
              <MaterialIcons name="code" size={16} color="#3A3458" />
              <Text style={styles.socialText}>GitHub</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <Pressable
            style={styles.footerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.footerText}>
              New here?{'  '}
              <Text style={styles.footerBold}>Sign up</Text>
            </Text>
          </Pressable>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 40,
  },

  backBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F1FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  mascotWrap: { alignItems: 'center', marginBottom: 20 },
  mascot: { width: 90, height: 90 },

  titleBlock: { alignItems: 'center', marginBottom: 28 },
  title: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 26,
    color: '#1A1033',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    color: '#6E6788',
  },

  form: { gap: 0 },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F7F5FF',
    borderWidth: 1.5,
    borderColor: '#ECE7FB',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 12,
  },
  fieldFocused: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3EEFF',
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: '#1A1033',
    height: '100%',
  },

  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#7C3AED',
  },

  primaryBtn: { borderRadius: 15, overflow: 'hidden', marginBottom: 20 },
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

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F0ECFB' },
  dividerLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: '#A99BCF',
  },

  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  socialBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ECE7FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  socialIcon: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 15,
    color: '#3A3458',
  },
  socialText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#3A3458',
  },

  footerLink: { alignItems: 'center' },
  footerText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    color: '#6E6788',
  },
  footerBold: {
    fontFamily: Typography.fontFamily.bold,
    color: '#7C3AED',
  },

  pressed: { opacity: 0.75 },
});
