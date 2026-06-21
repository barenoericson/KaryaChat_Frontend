import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, StatusBar, Alert, Switch, Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usersService, avatarUrl } from '../services/users.service';
import { Colors, Typography, Spacing, Radius, Shadows, Gradients } from '../constants/theme';

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronRight = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={Colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Menu config ─────────────────────────────────────────────────────────────

const MENU_SECTIONS = [
  {
    items: [
      { icon: '⚙️', label: 'Account Settings', key: 'settings' },
      { icon: '🔔', label: 'Notifications Setting', key: 'notifications' },
    ],
  },
  {
    items: [
      { icon: '🔒', label: 'Privacy & Policy', key: 'privacy' },
      { icon: '❓', label: 'Help Center', key: 'help' },
      { icon: 'ℹ️', label: 'About Us', key: 'about' },
    ],
  },
];

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [uploading, setUploading] = useState(false);

  const getInitials = () => (user?.username ?? 'U')[0].toUpperCase();

  const handleMenuItem = (_key: string) => {
    Alert.alert('Coming Soon', 'This feature will be available in a future update.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ],
    );
  };

  const handleAvatarPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    try {
      setUploading(true);
      const { user: updated } = await usersService.uploadAvatar(result.assets[0].uri);
      await updateUser({ ...user!, avatar: updated.avatar });
    } catch {
      Alert.alert('Upload failed', 'Could not upload your profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const bg            = isDark ? '#0F0A1E' : Colors.background;
  const surface       = isDark ? '#1A1033' : Colors.surface;
  const textPrimary   = isDark ? '#F0EBFF' : Colors.textPrimary;
  const textSecondary = isDark ? '#B8A9D0' : Colors.textSecondary;
  const borderColor   = isDark ? '#2D1B4E' : Colors.border;
  const dividerColor  = isDark ? '#1F1340' : Colors.divider;

  const avatarSrc = avatarUrl(user?.avatar);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* ── Purple header ── */}
      <LinearGradient colors={Gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>MY ACCOUNT</Text>

        {/* Avatar with tap-to-change */}
        <Pressable style={styles.avatarWrap} onPress={handleAvatarPress} disabled={uploading}>
          {avatarSrc ? (
            <Image source={{ uri: avatarSrc }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{getInitials()}</Text>
            </View>
          )}

          {/* Camera badge */}
          <View style={styles.cameraBadge}>
            {uploading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.cameraIcon}>📷</Text>
            }
          </View>
        </Pressable>

        <Text style={styles.displayName}>{user?.username ?? 'User'}</Text>
        <Text style={styles.displayEmail}>{user?.email ?? ''}</Text>

        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>
            {user?.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Dark mode toggle ── */}
        <View style={[styles.menuCard, { backgroundColor: surface, borderColor }]}>
          <View style={styles.menuRow}>
            <View style={styles.menuIconBox}>
              <Text style={styles.menuIcon}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
            <Text style={[styles.menuLabel, { color: textPrimary }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.textInverse}
            />
          </View>
        </View>

        {/* ── Menu sections ── */}
        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={[styles.menuCard, { backgroundColor: surface, borderColor }]}>
            {section.items.map((item, ii) => (
              <React.Fragment key={item.key}>
                <Pressable
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && { backgroundColor: bg },
                  ]}
                  onPress={() => handleMenuItem(item.key)}
                >
                  <View style={styles.menuIconBox}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.menuLabel, { color: textPrimary }]}>{item.label}</Text>
                  <ChevronRight />
                </Pressable>
                {ii < section.items.length - 1 && <View style={[styles.divider, { backgroundColor: dividerColor }]} />}
              </React.Fragment>
            ))}
          </View>
        ))}

        {/* ── Account info ── */}
        <View style={[styles.infoCard, { backgroundColor: surface, borderColor }]}>
          <Text style={[styles.infoTitle, { color: textPrimary }]}>Account Info</Text>
          <View style={[styles.infoRow, { borderBottomColor: dividerColor }]}>
            <Text style={[styles.infoKey, { color: textSecondary }]}>Email</Text>
            <Text style={[styles.infoVal, { color: textPrimary }]} numberOfLines={1}>{user?.email ?? '—'}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={[styles.infoKey, { color: textSecondary }]}>Email Verified</Text>
            <Text style={[styles.infoVal, { color: textPrimary }]}>
              {user?.isEmailVerified ? '✅ Verified' : '❌ Not verified'}
            </Text>
          </View>
        </View>

        {/* ── Log out ── */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}
          onPress={handleLogout}
        >
          <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.logoutGrad}>
            <Text style={styles.logoutText}>Log Out</Text>
          </LinearGradient>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: Spacing.screenH,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.5,
    marginBottom: 20,
  },

  avatarWrap: { marginBottom: 14, position: 'relative' },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    ...Shadows.md,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitial: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size['4xl'],
    color: Colors.textInverse,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraIcon: { fontSize: 13 },

  displayName: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xl,
    color: Colors.textInverse,
    marginBottom: 4,
  },
  displayEmail: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: 14,
  },
  rolePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  rolePillText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textInverse,
  },

  scroll: { flex: 1 },
  content: {
    padding: Spacing.screenH,
    paddingTop: Spacing['5'],
  },

  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing['4'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['5'],
    paddingVertical: 15,
    gap: 14,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: { fontSize: 17 },
  menuLabel: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 66,
  },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing['5'],
    marginBottom: Spacing['4'],
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  infoTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    marginBottom: Spacing['3'],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoKey: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  infoVal: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    maxWidth: '58%',
    textAlign: 'right',
  },

  logoutBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  logoutGrad: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textInverse,
  },
});
