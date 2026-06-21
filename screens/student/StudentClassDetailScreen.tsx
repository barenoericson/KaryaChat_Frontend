import React, { useState } from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator,
  Alert, StyleSheet, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { classesService, Lesson, Exam } from '../../services/classes.service';
import { StudentStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';

type NavProp = StackNavigationProp<StudentStackParamList, 'StudentClassDetail'>;
type RoutePropType = RouteProp<StudentStackParamList, 'StudentClassDetail'>;

type Tab = 'lessons' | 'exams';

function LessonCard({ lesson, onPress }: { lesson: Lesson; onPress: () => void }) {
  const { isDark, colors: tc } = useTheme();
  const hasDeadline = !!lesson.deadline;
  const deadlinePassed = hasDeadline && new Date(lesson.deadline!) < new Date();

  const cardBg    = isDark ? tc.surface     : '#FFFFFF';
  const titleTxt  = isDark ? tc.textPrimary : '#1F1235';
  const badgeBg   = isDark ? tc.primarySoft : '#EDE9FE';
  const chevronC  = isDark ? '#6D28D9'      : '#C4B5FD';

  return (
    <Pressable
      style={({ pressed }) => [styles.lessonCard, { backgroundColor: cardBg }, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      <View style={[styles.orderBadge, { backgroundColor: badgeBg }]}>
        <Text style={styles.orderText}>{lesson.order}</Text>
      </View>
      <View style={styles.lessonMeta}>
        <Text style={[styles.lessonTitle, { color: titleTxt }]} numberOfLines={1}>{lesson.title}</Text>
        <View style={styles.lessonTags}>
          {lesson.codeSnippet && (
            <View style={[styles.tag, { backgroundColor: badgeBg }]}>
              <Text style={styles.tagText}>{'</>'} Code</Text>
            </View>
          )}
          {hasDeadline && (
            <View style={[styles.tag, deadlinePassed ? styles.tagRed : styles.tagGreen]}>
              <Text style={[styles.tagText, deadlinePassed ? styles.tagTextRed : styles.tagTextGreen]}>
                {deadlinePassed ? '⏰ Past due' : '📅 Due date set'}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Text style={[styles.chevron, { color: chevronC }]}>›</Text>
    </Pressable>
  );
}

export default function StudentClassDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<RoutePropType>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { isDark, colors: tc } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>('lessons');

  const bg       = isDark ? tc.background    : '#F5F3FF';
  const surface  = isDark ? tc.surface       : '#FFFFFF';
  const tabBdr   = isDark ? tc.border        : '#EDE9FE';
  const txtMuted = isDark ? tc.textMuted     : '#9CA3AF';
  const txtSec   = isDark ? tc.textSecondary : '#6B7280';
  const priTxt   = isDark ? tc.primaryLight  : '#4C1D95';
  const secLabel = isDark ? tc.primaryLight  : '#6D28D9';
  const badgeBg  = isDark ? tc.primarySoft   : '#EDE9FE';

  const { data: cls, isLoading } = useQuery({
    queryKey: ['class-detail', params.classId],
    queryFn: () => classesService.getClassDetail(params.classId),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['exams', params.classId],
    queryFn: () => classesService.getExams(params.classId),
    enabled: activeTab === 'exams',
  });

  const { mutate: leaveClass } = useMutation({
    mutationFn: () => classesService.leaveClass(params.classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolled-classes'] });
      navigation.goBack();
    },
    onError: () => Alert.alert('Error', 'Failed to leave class.'),
  });

  const confirmLeave = () => {
    Alert.alert(
      'Leave Class',
      `Leave "${cls?.name}"? You will need the class code to rejoin.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => leaveClass() },
      ],
    );
  };

  if (isLoading || !cls) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: bg }]}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Pressable onPress={confirmLeave}>
            <Text style={styles.leaveText}>Leave</Text>
          </Pressable>
        </View>

        <Text style={styles.className} numberOfLines={2}>{cls.name}</Text>
        <View style={styles.langBadge}>
          <Text style={styles.langBadgeText}>{cls.language}</Text>
        </View>
        {cls.description ? (
          <Text style={styles.classDesc} numberOfLines={2}>{cls.description}</Text>
        ) : null}

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>{cls.lessons?.length ?? 0}</Text>
            <Text style={styles.infoLabel}>Lessons</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>{cls.teacher?.username ?? '—'}</Text>
            <Text style={styles.infoLabel}>Teacher</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: surface, borderBottomColor: tabBdr }]}>
        <Pressable
          style={[styles.tab, activeTab === 'lessons' && styles.tabActive]}
          onPress={() => setActiveTab('lessons')}
        >
          <Text style={[styles.tabText, { color: txtMuted }, activeTab === 'lessons' && styles.tabTextActive]}>
            Lessons ({cls.lessons?.length ?? 0})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'exams' && styles.tabActive]}
          onPress={() => setActiveTab('exams')}
        >
          <Text style={[styles.tabText, { color: txtMuted }, activeTab === 'exams' && styles.tabTextActive]}>
            Exams ({exams.length})
          </Text>
        </Pressable>
      </View>

      {activeTab === 'lessons' ? (
        <FlatList
          data={cls.lessons}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LessonCard
              lesson={item}
              onPress={() => navigation.navigate('LessonDetail', { classId: cls.id, lessonId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={[styles.sectionLabel, { color: secLabel }]}>
              Lessons ({cls.lessons?.length ?? 0})
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={[styles.emptyTitle, { color: priTxt }]}>No lessons yet</Text>
              <Text style={[styles.emptyDesc, { color: txtSec }]}>Your teacher hasn't added any lessons yet.</Text>
            </View>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          <Text style={[styles.sectionLabel, { color: secLabel }]}>
            Exams ({exams.length})
          </Text>
          {exams.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={[styles.emptyTitle, { color: priTxt }]}>No exams yet</Text>
              <Text style={[styles.emptyDesc, { color: txtSec }]}>Your teacher hasn't created any exams yet.</Text>
            </View>
          ) : (
            exams.map((exam: Exam) => (
              <Pressable
                key={exam.id}
                style={({ pressed }) => [styles.lessonCard, { backgroundColor: surface }, pressed && { opacity: 0.85 }]}
                onPress={() => navigation.navigate('TakeExam', { classId: cls.id, examId: exam.id, examTitle: exam.title })}
              >
                <View style={[styles.orderBadge, { backgroundColor: badgeBg }]}>
                  <Text style={{ fontSize: 18 }}>📋</Text>
                </View>
                <View style={styles.lessonMeta}>
                  <Text style={[styles.lessonTitle, { color: priTxt }]} numberOfLines={1}>{exam.title}</Text>
                  <Text style={[styles.tagText, { color: txtSec }]}>
                    {exam.questions.length} question{exam.questions.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: '#C4B5FD' }]}>›</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  leaveText: { color: '#FCA5A5', fontSize: 15, fontWeight: '600' },
  className: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  langBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 8,
  },
  langBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  classDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 19, marginBottom: 14 },

  infoRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 14, alignItems: 'center',
  },
  infoItem: { flex: 1, alignItems: 'center' },
  infoDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.25)' },
  infoValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  infoLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },

  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#7C3AED' },
  tabText: { fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#7C3AED', fontWeight: '700' },

  list: { padding: 16, paddingBottom: 32 },
  sectionLabel: {
    fontSize: 13, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12,
  },

  lessonCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#7C3AED', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  orderBadge: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  orderText: { color: '#7C3AED', fontWeight: '800', fontSize: 14 },
  lessonMeta: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  lessonTags: { flexDirection: 'row', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { color: '#6D28D9', fontSize: 10, fontWeight: '600' },
  tagRed: { backgroundColor: '#FEE2E2' },
  tagTextRed: { color: '#DC2626' },
  tagGreen: { backgroundColor: '#D1FAE5' },
  tagTextGreen: { color: '#059669' },
  chevron: { fontSize: 22, fontWeight: '300' },

  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
