import React from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator,
  StyleSheet, ToastAndroid, Platform, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { classesService, ClassSummary } from '../../services/classes.service';
import { TeacherStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';

type NavProp = StackNavigationProp<TeacherStackParamList>;

const LANG_COLORS: Record<string, [string, string]> = {
  python: ['#3B82F6', '#1D4ED8'],
  javascript: ['#F59E0B', '#D97706'],
  typescript: ['#6366F1', '#4F46E5'],
  java: ['#EF4444', '#DC2626'],
  kotlin: ['#EC4899', '#DB2777'],
  swift: ['#F97316', '#EA580C'],
  'c++': ['#8B5CF6', '#7C3AED'],
  'c#': ['#10B981', '#059669'],
  php: ['#6D28D9', '#5B21B6'],
  ruby: ['#F43F5E', '#E11D48'],
  go: ['#14B8A6', '#0D9488'],
  rust: ['#EA580C', '#C2410C'],
  dart: ['#0EA5E9', '#0284C7'],
  flutter: ['#0EA5E9', '#0284C7'],
};

const LANG_EMOJI: Record<string, string> = {
  python: '🐍', javascript: '⚡', typescript: '🔷', java: '☕',
  kotlin: '🟣', swift: '🍎', 'c++': '⚙️', 'c#': '💠', php: '🐘',
  ruby: '💎', go: '🐹', rust: '🦀', dart: '🎯', flutter: '🎯',
};

function getLangStyle(lang: string): { colors: [string, string]; emoji: string } {
  const key = Object.keys(LANG_COLORS).find((k) => lang.toLowerCase().includes(k));
  return {
    colors: key ? LANG_COLORS[key] : ['#7C3AED', '#5B21B6'],
    emoji: key ? LANG_EMOJI[key] : '💻',
  };
}

async function copyCode(code: string) {
  await Clipboard.setStringAsync(code);
  if (Platform.OS === 'android') {
    ToastAndroid.show('Class code copied!', ToastAndroid.SHORT);
  } else {
    Alert.alert('Copied', `Class code "${code}" copied to clipboard.`);
  }
}

function ClassCard({
  item,
  onPress,
  onCodePress,
}: {
  item: ClassSummary;
  onPress: () => void;
  onCodePress: () => void;
}) {
  const { isDark, colors: tc } = useTheme();
  const { colors: langColors, emoji } = getLangStyle(item.language);
  const lessonCount = item.lessons?.length ?? 0;

  const cardBg      = isDark ? tc.surface     : '#FFFFFF';
  const nameTxt     = isDark ? tc.textPrimary : '#1F1235';
  const descTxt     = isDark ? tc.textSecondary : '#6B7280';
  const statTxt     = isDark ? tc.textMuted   : '#9CA3AF';
  const badgeBg     = isDark ? tc.primarySoft : '#F3F4F6';
  const badgeTxt    = isDark ? tc.textSecondary : '#374151';
  const codePillBg  = isDark ? '#2D1B4E'      : '#EDE9FE';
  const codePillBdr = isDark ? '#4A235A'      : '#DDD6FE';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { backgroundColor: cardBg }, pressed && { opacity: 0.88 }]}
      onPress={onPress}
    >
      <LinearGradient colors={langColors} style={styles.cardAccent}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
      </LinearGradient>

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.cardName, { color: nameTxt }]} numberOfLines={1}>{item.name}</Text>
          <Pressable
            style={[styles.codePill, { backgroundColor: codePillBg, borderColor: codePillBdr }]}
            onPress={(e) => { e.stopPropagation(); onCodePress(); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.codePillText}>{item.classCode}</Text>
            <Text style={[styles.codePillCopy, { color: statTxt }]}>⎘</Text>
          </Pressable>
        </View>

        <View style={[styles.langBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.langBadgeText, { color: badgeTxt }]}>{item.language}</Text>
        </View>

        {item.description ? (
          <Text style={[styles.cardDesc, { color: descTxt }]} numberOfLines={2}>{item.description}</Text>
        ) : null}

        <View style={styles.cardStats}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={[styles.statText, { color: statTxt }]}>
              {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={[styles.statDot, { backgroundColor: isDark ? '#4A235A' : '#D1D5DB' }]} />
          <View style={styles.stat}>
            <Text style={styles.statIcon}>→</Text>
            <Text style={[styles.statText, styles.statLink]}>View class</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function TeacherClassesScreen() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const { isDark, colors: tc } = useTheme();

  const bg      = isDark ? tc.background : '#F5F3FF';
  const txtSec  = isDark ? tc.textSecondary : '#6B7280';
  const priTxt  = isDark ? tc.textPrimary : '#4C1D95';

  const { data: classes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: classesService.getMyClasses,
  });

  const totalLessons = classes.reduce((sum, c) => sum + (c.lessons?.length ?? 0), 0);

  return (
    <View style={[styles.safe, { backgroundColor: bg }]}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>My Classes</Text>
            <Text style={styles.headerSub}>Manage your programming courses</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.newBtn, pressed && { opacity: 0.8 }]}
            onPress={() => navigation.navigate('CreateClass')}
          >
            <Text style={styles.newBtnText}>+ New</Text>
          </Pressable>
        </View>

        {classes.length > 0 && (
          <View style={styles.statsStrip}>
            <View style={styles.stripStat}>
              <Text style={styles.stripValue}>{classes.length}</Text>
              <Text style={styles.stripLabel}>Classes</Text>
            </View>
            <View style={styles.stripDivider} />
            <View style={styles.stripStat}>
              <Text style={styles.stripValue}>{totalLessons}</Text>
              <Text style={styles.stripLabel}>Lessons</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>Failed to load classes</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClassCard
              item={item}
              onPress={() => navigation.navigate('TeacherClassDetail', { classId: item.id })}
              onCodePress={() => copyCode(item.classCode)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={[styles.emptyTitle, { color: priTxt }]}>No classes yet</Text>
              <Text style={[styles.emptyDesc, { color: txtSec }]}>
                Tap "+ New" above to create your first programming class.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.8 }]}
                onPress={() => navigation.navigate('CreateClass')}
              >
                <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.emptyBtnGrad}>
                  <Text style={styles.emptyBtnText}>Create First Class</Text>
                </LinearGradient>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  header: { paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 2 },
  headerSub: { color: 'rgba(255,255,255,0.72)', fontSize: 13 },
  newBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  newBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

  statsStrip: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 12,
  },
  stripStat: { flex: 1, alignItems: 'center' },
  stripDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 2 },
  stripValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  stripLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 1 },

  list: { padding: 16, paddingBottom: 40 },

  card: {
    flexDirection: 'row', borderRadius: 18,
    marginBottom: 14, overflow: 'hidden',
    shadowColor: '#7C3AED', shadowOpacity: 0.09, shadowRadius: 12, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardAccent: { width: 64, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 28 },
  cardBody: { flex: 1, padding: 14, paddingLeft: 12 },

  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardName: { flex: 1, fontSize: 16, fontWeight: '800' },
  codePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1,
  },
  codePillText: { color: '#6D28D9', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  codePillCopy: { fontSize: 13 },

  langBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginBottom: 6,
  },
  langBadgeText: { fontSize: 11, fontWeight: '600' },

  cardDesc: { fontSize: 12, lineHeight: 17, marginBottom: 8 },

  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statIcon: { fontSize: 12 },
  statText: { fontSize: 12, fontWeight: '600' },
  statLink: { color: '#7C3AED' },
  statDot: { width: 3, height: 3, borderRadius: 2 },

  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  emptyBtn: { borderRadius: 16, overflow: 'hidden' },
  emptyBtnGrad: { paddingHorizontal: 32, paddingVertical: 14 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },

  errorEmoji: { fontSize: 40, marginBottom: 12 },
  errorText: { color: '#DC2626', fontSize: 15, fontWeight: '600', marginBottom: 16 },
  retryBtn: { backgroundColor: '#7C3AED', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
