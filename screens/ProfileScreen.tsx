import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated, Dimensions, StatusBar,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/api';

const { width } = Dimensions.get('window');

const EditIcon = ({ color = '#C9A0DC', size = 16 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CameraIcon = ({ size = 18 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={13} r={4} stroke="#fff" strokeWidth={2} />
  </Svg>
);

const SaveIcon = ({ size = 18 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17 21v-8H7v8M7 3v5h8" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LogoutIcon = ({ size = 18 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#E74C3C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ size = 16 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke="#2ECC71" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIcon = ({ size = 16 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={7} r={4} stroke="#7B5EA7" strokeWidth={2} />
  </Svg>
);

const EmailIcon = ({ size = 16 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#3D2E5A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6l-10 7L2 6" stroke="#3D2E5A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ProfileScreen() {
  const { user, token, logout, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.15, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Sync state when user changes
  useEffect(() => {
    setUsername(user?.username || '');
    setBio(user?.bio || '');
    setAvatar(user?.avatar || '');
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library.');
        return;
      }

      Animated.sequence([
        Animated.timing(avatarScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.spring(avatarScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setAvatar(base64);
        setEditing(true);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.patch(
        `${API_BASE_URL}/users/profile`,
        { username: username.trim(), bio: bio.trim(), avatar },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await updateUser(res.data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername(user?.username || '');
    setBio(user?.bio || '');
    setAvatar(user?.avatar || '');
    setEditing(false);
  };

  const getInitials = () => (user?.username || 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080818" />
      <View style={styles.ring1} />
      <Animated.View style={[styles.glowBlob, { transform: [{ scale: glowPulse }] }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeIn }]}>
          <Text style={styles.headerTitle}>Profile</Text>
          {!editing ? (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setEditing(true)}
              activeOpacity={0.85}
            >
              <EditIcon size={15} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Avatar */}
        <Animated.View style={[styles.avatarSection, { opacity: fadeIn }]}>
          <Animated.View style={[styles.avatarWrap, { transform: [{ scale: avatarScale }] }]}>
            <Animated.View style={[styles.avatarGlow, { transform: [{ scale: glowPulse }] }]} />
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{getInitials()}</Text>
              </View>
            )}
            {editing && (
              <TouchableOpacity style={styles.cameraBtn} onPress={pickImage} activeOpacity={0.85}>
                <CameraIcon size={16} />
              </TouchableOpacity>
            )}
          </Animated.View>

          {!editing && (
            <>
              <Text style={styles.displayName}>{user?.username}</Text>
              <Text style={styles.displayEmail}>{user?.email}</Text>
              {user?.bio ? (
                <Text style={styles.displayBio}>{user.bio}</Text>
              ) : (
                <Text style={styles.noBio}>No bio yet — tap Edit to add one</Text>
              )}
            </>
          )}
        </Animated.View>

        {/* Stats — only when not editing */}
        {!editing && (
          <Animated.View style={[styles.statsRow, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
            {[
              { label: 'Courses', val: '5' },
              { label: 'Lessons', val: '0' },
              { label: 'Quizzes', val: '0' },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Edit form */}
        {editing && (
          <Animated.View style={[styles.form, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
            <Text style={styles.formTitle}>Edit Profile</Text>

            {/* Username */}
            <Text style={styles.fieldLabel}>USERNAME</Text>
            <View style={[styles.inputWrap, focusedField === 'username' && styles.inputWrapFocused]}>
              <UserIcon size={16} />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor="#3D2E5A"
                autoCapitalize="none"
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Bio */}
            <Text style={styles.fieldLabel}>BIO</Text>
            <View style={[
              styles.inputWrap, styles.bioWrap,
              focusedField === 'bio' && styles.inputWrapFocused
            ]}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell others about yourself..."
                placeholderTextColor="#3D2E5A"
                multiline
                maxLength={150}
                onFocus={() => setFocusedField('bio')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <Text style={styles.charCount}>{bio.length}/150</Text>

            {/* Email read only */}
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <View style={[styles.inputWrap, styles.inputDisabled]}>
              <EmailIcon size={16} />
              <Text style={styles.inputReadOnly}>{user?.email}</Text>
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>Locked</Text>
              </View>
            </View>

            {/* Save */}
            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.saveBtnInner}>
                  <SaveIcon size={18} />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Success toast */}
        {saved && (
          <Animated.View style={[styles.savedToast, { opacity: fadeIn }]}>
            <CheckIcon size={14} />
            <Text style={styles.savedToastText}>Profile updated successfully!</Text>
          </Animated.View>
        )}

        {/* Account info — only when not editing */}
        {!editing && (
          <Animated.View style={[styles.infoCard, { opacity: fadeIn }]}>
            <Text style={styles.infoCardTitle}>Account Info</Text>
            {[
              { label: 'Email', val: user?.email || '' },
              { label: 'Member since', val: 'April 2026' },
              { label: 'Email verified', val: user?.isEmailVerified ? '✅ Verified' : '❌ Not verified' },
            ].map((item, i) => (
              <View key={i} style={[styles.infoRow, i < 2 && styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoVal} numberOfLines={1}>{item.val}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Logout */}
        {!editing && (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
            <LogoutIcon size={18} />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080818' },
  scroll: { paddingHorizontal: 22, paddingBottom: 40 },
  ring1: {
    position: 'absolute', width: width * 1.3, height: width * 1.3,
    borderRadius: width * 0.65, borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.06)', top: -width * 0.5,
  },
  glowBlob: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(75,0,130,0.15)', top: -60, right: -80,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 56, marginBottom: 24,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(123,47,190,0.15)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(147,112,219,0.25)',
  },
  editBtnText: { color: '#C9A0DC', fontSize: 13, fontWeight: '700' },
  cancelBtn: {
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)',
  },
  cancelBtnText: { color: '#E74C3C', fontSize: 13, fontWeight: '700' },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatarGlow: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(123,47,190,0.25)', top: -5, left: -5,
  },
  avatarImg: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, borderColor: '#7B2FBE',
  },
  avatarPlaceholder: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#7B2FBE', justifyContent: 'center',
    alignItems: 'center', borderWidth: 3,
    borderColor: 'rgba(147,112,219,0.5)',
  },
  avatarInitial: { fontSize: 42, fontWeight: '900', color: '#fff' },
  cameraBtn: {
    position: 'absolute', bottom: 2, right: 2,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#7B2FBE', justifyContent: 'center',
    alignItems: 'center', borderWidth: 2, borderColor: '#080818',
  },
  displayName: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
  displayEmail: { fontSize: 13, color: '#7B5EA7', marginBottom: 10 },
  displayBio: {
    fontSize: 14, color: '#C9A0DC', textAlign: 'center',
    lineHeight: 20, paddingHorizontal: 20,
  },
  noBio: { fontSize: 13, color: '#3D2E5A', fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: '#0E0E28', borderRadius: 16,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.18)',
  },
  statVal: { fontSize: 20, fontWeight: '900', color: '#fff' },
  statLabel: {
    fontSize: 10, color: '#7B5EA7', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  form: {
    backgroundColor: '#0E0E28', borderRadius: 24,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.2)',
  },
  formTitle: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 20 },
  fieldLabel: {
    fontSize: 11, color: '#9B7EC8', fontWeight: '700',
    letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13132A', borderRadius: 14,
    paddingHorizontal: 14, marginBottom: 16,
    borderWidth: 1.5, borderColor: 'rgba(123,47,190,0.15)', gap: 10,
  },
  inputWrapFocused: { borderColor: '#7B2FBE', backgroundColor: '#16163A' },
  inputDisabled: { opacity: 0.5, marginBottom: 16 },
  bioWrap: { alignItems: 'flex-start', paddingTop: 12, paddingBottom: 8 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 14 },
  bioInput: { height: 80, textAlignVertical: 'top', paddingVertical: 0 },
  inputReadOnly: { flex: 1, color: '#5A4A7A', fontSize: 14, paddingVertical: 14 },
  lockedBadge: {
    backgroundColor: 'rgba(123,47,190,0.15)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.2)',
  },
  lockedText: { color: '#5A4A7A', fontSize: 10, fontWeight: '700' },
  charCount: {
    fontSize: 11, color: '#3D2E5A', textAlign: 'right',
    marginTop: -10, marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#7B2FBE', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
    shadowColor: '#7B2FBE', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 16, elevation: 10,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  savedToast: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(46,204,113,0.15)',
    borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)',
    justifyContent: 'center',
  },
  savedToastText: { color: '#2ECC71', fontSize: 14, fontWeight: '700' },
  infoCard: {
    backgroundColor: '#0E0E28', borderRadius: 20,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.18)',
  },
  infoCardTitle: { fontSize: 15, fontWeight: '900', color: '#fff', marginBottom: 14 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123,47,190,0.1)',
  },
  infoLabel: { fontSize: 13, color: '#7B5EA7', fontWeight: '600' },
  infoVal: {
    fontSize: 13, color: '#C9A0DC', fontWeight: '600',
    maxWidth: '60%', textAlign: 'right',
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    borderRadius: 14, paddingVertical: 14,
    borderWidth: 1.5, borderColor: 'rgba(231,76,60,0.3)',
    backgroundColor: 'rgba(231,76,60,0.08)',
  },
  logoutBtnText: { color: '#E74C3C', fontSize: 15, fontWeight: '700' },
});