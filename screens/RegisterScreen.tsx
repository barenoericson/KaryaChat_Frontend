import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Animated, StatusBar, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/api';
import { Typography } from '../constants/theme';

type Role = 'student' | 'teacher';

export default function RegisterScreen({ navigation }: any) {
  const { login } = useAuth();
  const [username, setUsername]             = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole]                     = useState<Role>('student');
  const [loading, setLoading]               = useState(false);
  const [showPwd, setShowPwd]               = useState(false);
  const [focused, setFocused]               = useState<string | null>(null);

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
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
        {/* Back + Title */}
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color="#1A1033" />
        </Pressable>

        <Animated.View style={[styles.titleBlock, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join CodeMate in seconds</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

          {/* Username */}
          <View style={[styles.field, focused === 'username' && styles.fieldFocused]}>
            <MaterialIcons name="person-outline" size={18} color={focused === 'username' ? '#7C3AED' : '#A99BCF'} />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#A99BCF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
              onFocus={() => setFocused('username')}
              onBlur={() => setFocused(null)}
            />
          </View>

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

          {/* Confirm password */}
          <View style={[styles.field, focused === 'confirm' && styles.fieldFocused]}>
            <MaterialIcons name="lock-outline" size={18} color={focused === 'confirm' ? '#7C3AED' : '#A99BCF'} />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#A99BCF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPwd}
              onFocus={() => setFocused('confirm')}
              onBlur={() => setFocused(null)}
            />
            {confirmPassword.length > 0 && (
              <MaterialIcons
                name={confirmPassword === password ? 'check-circle' : 'cancel'}
                size={18}
                color={confirmPassword === password ? '#16A34A' : '#C0392B'}
              />
            )}
          </View>

          {/* Role selector */}
          <Text style={styles.roleLabel}>I'm joining as...</Text>
          <View style={styles.roleRow}>
            {/* Student */}
            <Pressable
              style={[styles.roleCard, role === 'student' && styles.roleCardActive]}
              onPress={() => setRole('student')}
            >
              {role === 'student' && (
                <MaterialIcons name="check-circle" size={18} color="#7C3AED" style={styles.roleCheck} />
              )}
              <View style={[styles.roleIconWrap, role === 'student' && styles.roleIconWrapActive]}>
                <MaterialIcons name="school" size={22} color={role === 'student' ? '#7C3AED' : '#A99BCF'} />
              </View>
              <Text style={[styles.roleName, role === 'student' && styles.roleNameActive]}>Student</Text>
            </Pressable>

            {/* Teacher */}
            <Pressable
              style={[styles.roleCard, role === 'teacher' && styles.roleCardActive]}
              onPress={() => setRole('teacher')}
            >
              {role === 'teacher' && (
                <MaterialIcons name="check-circle" size={18} color="#7C3AED" style={styles.roleCheck} />
              )}
              <View style={[styles.roleIconWrap, role === 'teacher' && styles.roleIconWrapActive]}>
                <MaterialIcons name="cast-for-education" size={22} color={role === 'teacher' ? '#7C3AED' : '#A99BCF'} />
              </View>
              <Text style={[styles.roleName, role === 'teacher' && styles.roleNameActive]}>Teacher</Text>
            </Pressable>
          </View>

          {/* Create account button */}
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, (loading || pressed) && styles.pressed]}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.primaryGrad}>
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.primaryBtnText}>Create account</Text>}
            </LinearGradient>
          </Pressable>

          {/* Footer */}
          <Pressable style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
              Already have an account?{'  '}
              <Text style={styles.footerBold}>Log In</Text>
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
    marginBottom: 20,
  },

  titleBlock: { marginBottom: 24 },
  title: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 23,
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

  roleLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#1A1033',
    marginBottom: 10,
    marginTop: 4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    height: 88,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ECE7FB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    position: 'relative',
  },
  roleCardActive: {
    borderColor: '#7C3AED',
    borderWidth: 2,
    backgroundColor: '#F3EEFF',
  },
  roleCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  roleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0ECFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconWrapActive: {
    backgroundColor: '#E9DFFD',
  },
  roleName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 13,
    color: '#6E6788',
  },
  roleNameActive: {
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
