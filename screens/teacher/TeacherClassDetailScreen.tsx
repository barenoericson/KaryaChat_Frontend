import React, { useState } from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator,
  Alert, StyleSheet, ScrollView, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { classesService, Lesson, Exam } from '../../services/classes.service';
import { TeacherStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';

type NavProp = StackNavigationProp<TeacherStackParamList, 'TeacherClassDetail'>;
type RoutePropType = RouteProp<TeacherStackParamList, 'TeacherClassDetail'>;

type Tab = 'lessons' | 'students' | 'exams';

function LessonCard({
  lesson, onPress, onEdit, onDelete,
}: {
  lesson: Lesson;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { isDark, colors: tc } = useTheme();
  const hasDeadline = !!lesson.deadline;
  const deadlinePassed = hasDeadline && new Date(lesson.deadline!) < new Date();

  const cardBg   = isDark ? tc.surface     : '#FFFFFF';
  const titleTxt = isDark ? tc.textPrimary : '#1F1235';
  const badgeBg  = isDark ? tc.primarySoft : '#EDE9FE';
  const actionBg = isDark ? tc.surfaceAlt  : '#F5F3FF';
  const chevronC = isDark ? '#6D28D9'      : '#C4B5FD';

  return (
    <Pressable
      style={({ pressed }) => [styles.lessonCard, { backgroundColor: cardBg }, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      <View style={styles.lessonLeft}>
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
                  {deadlinePassed ? '⏰ Past due' : '📅 Has deadline'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.lessonActions}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, { backgroundColor: actionBg }, pressed && { opacity: 0.6 }]}
          onPress={(e) => { e.stopPropagation?.(); onEdit(); }}
          hitSlop={8}
        >
          <Text style={styles.actionBtnText}>✏️</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, { backgroundColor: actionBg }, pressed && { opacity: 0.6 }]}
          onPress={(e) => { e.stopPropagation?.(); onDelete(); }}
          hitSlop={8}
        >
          <Text style={styles.actionBtnText}>🗑️</Text>
        </Pressable>
        <Text style={[styles.chevron, { color: chevronC }]}>›</Text>
      </View>
    </Pressable>
  );
}

export default function TeacherClassDetailScreen() {
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
  const txtPri   = isDark ? tc.textPrimary   : '#1F1235';
  const priTxt   = isDark ? tc.textPrimary   : '#4C1D95';
  const descTxt  = isDark ? tc.textSecondary : '#6B7280';
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

  const { mutate: deleteClass } = useMutation({
    mutationFn: () => classesService.deleteClass(params.classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] });
      navigation.goBack();
    },
    onError: () => Alert.alert('Error', 'Failed to delete class.'),
  });

  const { mutate: deleteLesson } = useMutation({
    mutationFn: (lessonId: string) => classesService.deleteLesson(params.classId, lessonId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['class-detail', params.classId] }),
    onError: () => Alert.alert('Error', 'Failed to delete lesson.'),
  });

  const confirmDelete = () => {
    Alert.alert(
      'Delete Class',
      `Delete "${cls?.name}"? This removes all lessons and student data permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteClass() },
      ],
    );
  };

  const confirmDeleteLesson = (lesson: Lesson) => {
    Alert.alert(
      'Delete Lesson',
      `Delete "${lesson.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteLesson(lesson.id) },
      ],
    );
  };

  const shareCode = () => {
    if (!cls) return;
    Share.share({
      message: `Join my CodeMate class "${cls.name}"!\nClass code: ${cls.classCode}`,
    });
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
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate('EditClass', { classId: params.classId })}
              style={styles.editClassBtn}
            >
              <Text style={styles.editClassText}>Edit</Text>
            </Pressable>
            <Pressable onPress={confirmDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.className} numberOfLines={2}>{cls.name}</Text>
        <View style={styles.langBadge}>
          <Text style={styles.langBadgeText}>{cls.language}</Text>
        </View>
        {cls.description ? (
          <Text style={styles.classDesc} numberOfLines={2}>{cls.description}</Text>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{cls.students?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{cls.lessons?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statDivider} />
          <Pressable style={styles.codeCard} onPress={shareCode}>
            <Text style={styles.codeValue}>{cls.classCode}</Text>
            <Text style={styles.codeLabel}>Tap to share code</Text>
          </Pressable>
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
          style={[styles.tab, activeTab === 'students' && styles.tabActive]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.tabText, { color: txtMuted }, activeTab === 'students' && styles.tabTextActive]}>
            Students ({cls.students?.length ?? 0})
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
              onEdit={() => navigation.navigate('EditLesson', { classId: cls.id, lessonId: item.id })}
              onDelete={() => confirmDeleteLesson(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Pressable
              style={({ pressed }) => [styles.addLessonBtn, pressed && { opacity: 0.8 }]}
              onPress={() => navigation.navigate('CreateLesson', { classId: cls.id })}
            >
              <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.addLessonGrad}>
                <Text style={styles.addLessonText}>+ Add Lesson</Text>
              </LinearGradient>
            </Pressable>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={[styles.emptyTitle, { color: priTxt }]}>No lessons yet</Text>
              <Text style={[styles.emptyDesc, { color: descTxt }]}>Add your first lesson to get started</Text>
            </View>
          }
        />
      ) : activeTab === 'students' ? (
        <ScrollView contentContainerStyle={styles.listContent}>
          {(cls.students?.length ?? 0) === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={[styles.emptyTitle, { color: priTxt }]}>No students yet</Text>
              <Text style={[styles.emptyDesc, { color: descTxt }]}>
                Share your class code{' '}
                <Text style={styles.codeInline}>{cls.classCode}</Text>
                {' '}for students to join
              </Text>
            </View>
          ) : (
            cls.students.map((student, idx) => (
              <View key={student.id} style={[styles.studentRow, { backgroundColor: surface }]}>
                <View style={[styles.studentAvatar, { backgroundColor: badgeBg }]}>
                  <Text style={styles.studentAvatarText}>
                    {student.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.studentName, { color: txtPri }]}>{student.username}</Text>
                  <Text style={[styles.studentMeta, { color: txtMuted }]}>Student #{idx + 1}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          <Pressable
            style={({ pressed }) => [styles.addLessonBtn, pressed && { opacity: 0.8 }]}
            onPress={() => navigation.navigate('CreateExam', { classId: cls.id })}
          >
            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.addLessonGrad}>
              <Text style={styles.addLessonText}>+ Create Exam</Text>
            </LinearGradient>
          </Pressable>

          {exams.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={[styles.emptyTitle, { color: priTxt }]}>No exams yet</Text>
              <Text style={[styles.emptyDesc, { color: descTxt }]}>Create your first exam for this class</Text>
            </View>
          ) : (
            exams.map((exam: Exam) => (
              <Pressable
                key={exam.id}
                style={({ pressed }) => [styles.lessonCard, { backgroundColor: surface }, pressed && { opacity: 0.85 }]}
                onPress={() => navigation.navigate('ExamResults', { classId: cls.id, examId: exam.id, examTitle: exam.title })}
              >
                <View style={styles.lessonLeft}>
                  <View style={[styles.orderBadge, { backgroundColor: badgeBg }]}>
                    <Text style={{ fontSize: 18 }}>📋</Text>
                  </View>
                  <View style={styles.lessonMeta}>
                    <Text style={[styles.lessonTitle, { color: txtPri }]} numberOfLines={1}>{exam.title}</Text>
                    <Text style={[styles.tagText, { color: txtMuted }]}>
                      {exam.questions.length} question{exam.questions.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.chevron, { color: txtMuted }]}>›</Text>
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  editClassBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  editClassText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  deleteText: { color: '#FCA5A5', fontSize: 15, fontWeight: '600' },
  className: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  langBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 6,
  },
  langBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  classDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 19, marginBottom: 16 },

  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 14, alignItems: 'center',
  },
  statCard: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.25)' },
  statValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  codeCard: { flex: 1.4, alignItems: 'center' },
  codeValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 3 },
  codeLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#7C3AED' },
  tabText: { fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#7C3AED', fontWeight: '700' },

  listContent: { padding: 16, paddingBottom: 32 },

  addLessonBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  addLessonGrad: { paddingVertical: 14, alignItems: 'center' },
  addLessonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  lessonCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#7C3AED', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lessonLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  orderBadge: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
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
  lessonActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
  },
  actionBtnText: { fontSize: 14 },
  chevron: { fontSize: 22, fontWeight: '300', marginLeft: 4 },

  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  codeInline: { color: '#7C3AED', fontWeight: '700' },

  studentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#7C3AED', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  studentAvatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  studentAvatarText: { color: '#7C3AED', fontSize: 18, fontWeight: '800' },
  studentName: { fontSize: 15, fontWeight: '700' },
  studentMeta: { fontSize: 12, marginTop: 2 },
});
