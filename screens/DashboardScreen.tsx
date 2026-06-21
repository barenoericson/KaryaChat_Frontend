import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, Animated, StatusBar, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types/auth.types';
import { classesService } from '../services/classes.service';
import { Colors, Typography, Spacing, Radius, Shadows, Gradients } from '../constants/theme';
import { avatarUrl } from '../services/users.service';

// ─── Icons ────────────────────────────────────────────────────────────────────

const BookIcon = ({ color = Colors.primary, size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UsersIcon = ({ color = Colors.primary, size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={2} />
    <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BotIcon = ({ color = Colors.primary, size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={8} width={18} height={13} rx={3} stroke={color} strokeWidth={2} />
    <Path d="M9 12h.01M15 12h.01" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Path d="M9 16s1 1 3 1 3-1 3-1" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M12 8V5M9 5h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const PlusIcon = ({ color = Colors.primary, size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRightIcon = ({ color = Colors.textMuted }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Quick action cards ───────────────────────────────────────────────────────

interface QuickAction {
  label: string;
  icon: 'book' | 'bot' | 'users' | 'plus';
  color: string;
  bg: string;
}

const TEACHER_ACTIONS: QuickAction[] = [
  { label: 'New Class', icon: 'plus', color: Colors.primary, bg: Colors.primarySoft },
  { label: 'AI Brainstorm', icon: 'bot', color: '#059669', bg: '#D1FAE5' },
  { label: 'My Classes', icon: 'book', color: '#D97706', bg: '#FEF3C7' },
];

const STUDENT_ACTIONS: QuickAction[] = [
  { label: 'Join Class', icon: 'plus', color: Colors.primary, bg: Colors.primarySoft },
  { label: 'AI Tutor', icon: 'bot', color: '#059669', bg: '#D1FAE5' },
  { label: 'My Classes', icon: 'book', color: '#D97706', bg: '#FEF3C7' },
];

function ActionCard({ action, onPress }: { action: QuickAction; onPress: () => void }) {
  const icons: Record<QuickAction['icon'], React.ReactNode> = {
    book: <BookIcon color={action.color} size={22} />,
    bot: <BotIcon color={action.color} size={22} />,
    users: <UsersIcon color={action.color} size={22} />,
    plus: <PlusIcon color={action.color} size={22} />,
  };
  return (
    <Pressable
      style={({ pressed }) => [styles.actionCard, { backgroundColor: action.bg }, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: action.color + '25' }]}>
        {icons[action.icon]}
      </View>
      <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
    </Pressable>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Main screen ──────────────────────────────────────────────────────────────

const LANG_EMOJI: Record<string, string> = {
  python: '🐍', javascript: '⚡', typescript: '🔷', java: '☕',
  kotlin: '🟣', swift: '🍎', 'c++': '⚙️', 'c#': '💠', php: '🐘',
  ruby: '💎', go: '🐹', rust: '🦀', dart: '🎯', flutter: '🎯',
};

function langEmoji(lang: string): string {
  const key = Object.keys(LANG_EMOJI).find((k) => lang.toLowerCase().includes(k));
  return key ? LANG_EMOJI[key] : '💻';
}

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const isTeacher = user?.role === UserRole.TEACHER;

  const bg       = isDark ? colors.background  : Colors.background;
  const surface  = isDark ? colors.surface     : Colors.surface;
  const txtPri   = isDark ? colors.textPrimary : Colors.textPrimary;
  const txtMuted = isDark ? colors.textMuted   : Colors.textMuted;
  const border   = isDark ? colors.border      : Colors.border;
  const priSoft  = isDark ? colors.primarySoft : Colors.primarySoft;

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: isTeacher ? ['teacher-classes'] : ['enrolled-classes'],
    queryFn: isTeacher ? classesService.getMyClasses : classesService.getEnrolledClasses,
  });

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleAction = (label: string) => {
    if (isTeacher) {
      if (label === 'New Class') navigation.getParent?.()?.navigate('CreateClass');
      else if (label === 'AI Brainstorm') navigation.navigate('AiBrainstorm');
      else navigation.navigate('Classes');
    } else {
      if (label === 'Join Class') navigation.getParent?.()?.navigate('JoinClass');
      else if (label === 'AI Tutor') navigation.navigate('AiTutor');
      else navigation.navigate('Classes');
    }
  };

  const actions = isTeacher ? TEACHER_ACTIONS : STUDENT_ACTIONS;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* ── Gradient header ── */}
      <LinearGradient colors={Gradients.primary} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.username}>{user?.username ?? 'User'} 👋</Text>
          </View>
          {avatarUrl(user?.avatar) ? (
            <Image source={{ uri: avatarUrl(user!.avatar)! }} style={styles.avatarCircle} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {(user?.username ?? 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {isTeacher ? '👨‍🏫 Teacher' : '🎓 Student'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── AI banner ── */}
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <LinearGradient
            colors={['#5B21B6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiBanner}
          >
            <View style={styles.aiBannerContent}>
              <Text style={styles.aiBannerTitle}>
                {isTeacher ? 'Brainstorm Lessons' : 'Your AI Tutor'}
              </Text>
              <Text style={styles.aiBannerSub}>
                {isTeacher
                  ? 'Let AI help you design engaging lessons and quizzes.'
                  : 'Ask any coding question — I\'ll guide you step by step.'}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.aiBannerBtn, pressed && { opacity: 0.85 }]}
                onPress={() => navigation.navigate(isTeacher ? 'AiBrainstorm' : 'AiTutor')}
              >
                <Text style={styles.aiBannerBtnText}>Start Chatting  →</Text>
              </Pressable>
            </View>
            <Text style={styles.aiBannerEmoji}>🤖</Text>
          </LinearGradient>
        </Animated.View>

        {/* ── Quick actions ── */}
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Text style={[styles.sectionLabel, { color: txtPri }]}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {actions.map((a) => (
              <ActionCard key={a.label} action={a} onPress={() => handleAction(a.label)} />
            ))}
          </View>
        </Animated.View>

        {/* ── Recent classes ── */}
        <Animated.View style={{ opacity: fade }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, { color: txtPri }]}>
              {isTeacher ? 'My Classes' : 'Enrolled Classes'}
            </Text>
            <Pressable onPress={() => navigation.navigate('Classes')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </Pressable>
          </View>

          {classesLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
          ) : classes.length === 0 ? (
            <Pressable
              style={[styles.emptyClassCard, { backgroundColor: surface, borderColor: priSoft }]}
              onPress={() => navigation.navigate('Classes')}
            >
              <Text style={styles.emptyClassEmoji}>{isTeacher ? '📚' : '🎒'}</Text>
              <Text style={[styles.emptyClassText, { color: colors.primary }]}>
                {isTeacher ? 'Create your first class' : 'Join your first class'}
              </Text>
            </Pressable>
          ) : (
            classes.slice(0, 3).map((cls) => (
              <Pressable
                key={cls.id}
                style={({ pressed }) => [styles.classCard, { backgroundColor: surface, borderColor: border }, pressed && { opacity: 0.9 }]}
                onPress={() =>
                  navigation.getParent?.()?.navigate(
                    isTeacher ? 'TeacherClassDetail' : 'StudentClassDetail',
                    { classId: cls.id },
                  )
                }
              >
                <View style={[styles.classIcon, { backgroundColor: priSoft }]}>
                  <Text style={styles.classEmoji}>{langEmoji(cls.language)}</Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={[styles.classTitle, { color: txtPri }]}>{cls.name}</Text>
                  <Text style={[styles.classSub, { color: txtMuted }]}>
                    {isTeacher
                      ? `${cls.lessons?.length ?? 0} lesson${(cls.lessons?.length ?? 0) !== 1 ? 's' : ''}`
                      : `${cls.language} · ${cls.lessons?.length ?? 0} lessons`}
                  </Text>
                </View>
                <ChevronRightIcon color={txtMuted} />
              </Pressable>
            ))
          )}
        </Animated.View>

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
    paddingBottom: 24,
    paddingHorizontal: Spacing.screenH,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  username: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size['2xl'],
    color: Colors.textInverse,
    marginTop: 2,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  avatarInitial: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textInverse,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roleBadgeText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.textInverse,
  },

  scroll: { flex: 1 },
  content: {
    padding: Spacing.screenH,
    paddingTop: Spacing['5'],
  },

  // AI banner
  aiBanner: {
    borderRadius: Radius.xl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['6'],
    ...Shadows.md,
  },
  aiBannerContent: { flex: 1 },
  aiBannerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textInverse,
    marginBottom: 4,
  },
  aiBannerSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 17,
    marginBottom: 12,
  },
  aiBannerBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  aiBannerBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textInverse,
  },
  aiBannerEmoji: { fontSize: 54, marginLeft: 8 },

  // Section labels
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing['3'],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['3'],
  },
  seeAll: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },

  // Quick actions
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing['6'],
  },
  actionCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    ...Shadows.sm,
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    textAlign: 'center',
  },

  // Class cards
  classCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  classIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classEmoji: { fontSize: 26 },
  classInfo: { flex: 1 },
  classTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  classSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.primary,
    minWidth: 32,
    textAlign: 'right',
  },

  emptyClassCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.primarySoft,
    borderStyle: 'dashed',
  },
  emptyClassEmoji: { fontSize: 28 },
  emptyClassText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.primary,
  },
});
