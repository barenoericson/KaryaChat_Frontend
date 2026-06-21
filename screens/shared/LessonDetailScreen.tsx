import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, ActivityIndicator,
  StyleSheet, Alert, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { classesService } from '../../services/classes.service';
import { submissionsService, Submission } from '../../services/submissions.service';
import { quizzesService } from '../../services/quizzes.service';
import { CLASS_LANG_TO_PISTON } from '../../services/piston.service';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth.types';
import { TeacherStackParamList, StudentStackParamList } from '../../navigation/types';

function formatDeadline(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(type: string): string {
  if (type.includes('pdf')) return '📄';
  if (type.includes('image')) return '🖼️';
  if (type.includes('zip')) return '📦';
  if (type.includes('word') || type.includes('document')) return '📝';
  return '📎';
}

// ─── Teacher View ─────────────────────────────────────────────────────────────

function SubmissionRow({ sub }: { sub: Submission }) {
  const isImage = sub.fileType.startsWith('image/');
  return (
    <View style={styles.subRow}>
      <View style={styles.subAvatar}>
        <Text style={styles.subAvatarText}>
          {(sub.student?.username ?? '?').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.subInfo}>
        <Text style={styles.subName}>{sub.student?.username ?? 'Unknown'}</Text>
        <Text style={styles.subMeta}>
          {fileIcon(sub.fileType)} {sub.fileName} · {formatFileSize(sub.fileSize)}
        </Text>
        <Text style={styles.subDate}>
          Submitted {new Date(sub.submittedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      </View>
      <Pressable onPress={() => Linking.openURL(sub.fileUrl)} style={styles.viewBtn}>
        <Text style={styles.viewBtnText}>{isImage ? '🔍' : '↓'}</Text>
      </Pressable>
    </View>
  );
}

function NotSubmittedRow({ student }: { student: { id: string; username: string } }) {
  return (
    <View style={styles.notSubRow}>
      <View style={[styles.subAvatar, styles.notSubAvatar]}>
        <Text style={styles.notSubAvatarText}>
          {student.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.subInfo}>
        <Text style={styles.subName}>{student.username}</Text>
        <Text style={styles.notSubLabel}>Not yet submitted</Text>
      </View>
      <View style={styles.notSubBadge}>
        <Text style={styles.notSubBadgeText}>Pending</Text>
      </View>
    </View>
  );
}

function TeacherLessonView({ classId, lessonId }: { classId: string; lessonId: string }) {
  const navigation = useNavigation<StackNavigationProp<TeacherStackParamList>>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson-detail', classId, lessonId],
    queryFn: () => classesService.getLesson(classId, lessonId),
  });

  const { data: submissions = [], isLoading: subsLoading } = useQuery({
    queryKey: ['submissions', classId, lessonId],
    queryFn: () => submissionsService.getForLesson(classId, lessonId),
  });

  const { data: classDetail } = useQuery({
    queryKey: ['class-detail', classId],
    queryFn: () => classesService.getClassDetail(classId),
  });

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz', classId, lessonId],
    queryFn: () => quizzesService.getQuiz(classId, lessonId).catch(() => null),
  });

  const { mutate: generateQuiz, isPending: generating } = useMutation({
    mutationFn: () => quizzesService.generate(classId, lessonId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quiz', classId, lessonId] }),
    onError: () => Alert.alert('Error', 'Failed to generate quiz. Please try again.'),
  });

  if (lessonLoading || !lesson) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#7C3AED" /></View>;
  }

  const deadlinePassed = lesson.deadline ? new Date(lesson.deadline) < new Date() : false;
  const submittedIds = new Set(submissions.map((s) => s.studentId));
  const notSubmitted = (classDetail?.students ?? []).filter((s) => !submittedIds.has(s.id));

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={[styles.backBtn, { marginTop: insets.top > 0 ? 8 : 16 }]} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        {/* Lesson header */}
        <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.lessonHeader}>
          <View style={styles.orderPill}>
            <Text style={styles.orderPillText}>Lesson {lesson.order}</Text>
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          {lesson.deadline && (
            <View style={[styles.deadlineBanner, deadlinePassed && styles.deadlineBannerRed]}>
              <Text style={styles.deadlineBannerText}>
                {deadlinePassed ? '⏰ Deadline passed · ' : '📅 Due · '}
                {formatDeadline(lesson.deadline)}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Lesson Content</Text>
          <Text style={styles.contentText}>{lesson.content}</Text>
        </View>

        {lesson.codeSnippet ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Code Snippet</Text>
            <View style={styles.codeBox}>
              <View style={styles.codeDots}>
                <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
                <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
                <View style={[styles.dot, { backgroundColor: '#28C840' }]} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.codeText}>{lesson.codeSnippet}</Text>
              </ScrollView>
            </View>
          </View>
        ) : null}

        {/* Quiz section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI Quiz</Text>
          {quizLoading ? (
            <ActivityIndicator color="#7C3AED" style={{ marginTop: 8 }} />
          ) : quiz ? (
            <View style={styles.quizCard}>
              <View style={styles.quizCardTop}>
                <Text style={styles.quizCardIcon}>🧩</Text>
                <View style={styles.quizCardTextBlock}>
                  <Text style={styles.quizCardTitle}>{quiz.questions.length} Questions generated</Text>
                  <Text style={styles.quizCardSub}>Quiz is live — students can take it now</Text>
                </View>
              </View>
              <View style={styles.quizActions}>
                <Pressable
                  style={({ pressed }) => [styles.quizBtn, { flex: 1 }, pressed && { opacity: 0.7 }]}
                  onPress={() => navigation.navigate('QuizResults', { classId, lessonId, lessonTitle: lesson!.title })}
                >
                  <Text style={styles.quizBtnText}>📊 View Results</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.quizBtnOutline, { flex: 1 }, pressed && { opacity: 0.7 }]}
                  onPress={() => generateQuiz()}
                  disabled={generating}
                >
                  <Text style={styles.quizBtnOutlineText}>{generating ? 'Generating…' : '🔄 Regenerate'}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => generateQuiz()}
              disabled={generating}
              style={({ pressed }) => [{ opacity: pressed || generating ? 0.7 : 1 }]}
            >
              <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.generateBtn}>
                {generating
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.generateBtnText}>✨ Generate AI Quiz</Text>}
              </LinearGradient>
            </Pressable>
          )}
        </View>

        {/* Submitted */}
        <View style={styles.section}>
          <View style={styles.submissionHeader}>
            <Text style={styles.sectionLabel}>
              Submitted ({subsLoading ? '…' : submissions.length})
            </Text>
            {!subsLoading && (
              <View style={styles.submissionStats}>
                <View style={styles.statPill}>
                  <Text style={styles.statPillText}>
                    ✅ {submissions.length} / {(classDetail?.students ?? []).length}
                  </Text>
                </View>
              </View>
            )}
          </View>
          {subsLoading ? (
            <ActivityIndicator color="#7C3AED" style={{ marginTop: 16 }} />
          ) : submissions.length === 0 ? (
            <View style={styles.emptySubmissions}>
              <Text style={styles.emptySubText}>No submissions yet</Text>
            </View>
          ) : (
            submissions.map((sub) => <SubmissionRow key={sub.id} sub={sub} />)
          )}
        </View>

        {/* Not submitted */}
        {!subsLoading && notSubmitted.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Not Yet Submitted ({notSubmitted.length})
            </Text>
            {notSubmitted.map((student) => (
              <NotSubmittedRow key={student.id} student={student} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Student View ─────────────────────────────────────────────────────────────

function StudentLessonView({ classId, lessonId }: { classId: string; lessonId: string }) {
  const navigation = useNavigation<StackNavigationProp<StudentStackParamList>>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [uploading, setUploading] = useState(false);

  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson-detail', classId, lessonId],
    queryFn: () => classesService.getLesson(classId, lessonId),
  });

  const { data: studentClassDetail } = useQuery({
    queryKey: ['class-detail', classId],
    queryFn: () => classesService.getClassDetail(classId),
  });

  const { data: mySubmission, isLoading: subLoading } = useQuery({
    queryKey: ['my-submission', classId, lessonId],
    queryFn: () => submissionsService.getMySubmission(classId, lessonId),
  });

  const { data: quiz } = useQuery({
    queryKey: ['quiz', classId, lessonId],
    queryFn: () => quizzesService.getQuiz(classId, lessonId).catch(() => null),
  });

  const { data: myQuizResult } = useQuery({
    queryKey: ['quiz-my-result', classId, lessonId],
    queryFn: () => quizzesService.getMyResult(classId, lessonId),
  });

  const handleTurnIn = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/zip',
          'text/plain', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setUploading(true);
      await submissionsService.submit(classId, lessonId, {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/octet-stream',
      });
      queryClient.invalidateQueries({ queryKey: ['my-submission', classId, lessonId] });
      Alert.alert('Submitted!', 'Your work has been submitted successfully.');
    } catch {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (lessonLoading || !lesson) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#7C3AED" /></View>;
  }

  const deadlinePassed = lesson.deadline ? new Date(lesson.deadline) < new Date() : false;

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={[styles.backBtn, { marginTop: insets.top > 0 ? 8 : 16 }]} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        {/* Lesson header */}
        <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.lessonHeader}>
          <View style={styles.orderPill}>
            <Text style={styles.orderPillText}>Lesson {lesson.order}</Text>
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          {lesson.deadline && (
            <View style={[styles.deadlineBanner, deadlinePassed && styles.deadlineBannerRed]}>
              <Text style={styles.deadlineBannerText}>
                {deadlinePassed ? '⏰ Deadline passed · ' : '📅 Due · '}
                {formatDeadline(lesson.deadline)}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Lesson Content</Text>
          <Text style={styles.contentText}>{lesson.content}</Text>
        </View>

        {lesson.codeSnippet ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Code Snippet</Text>
            <View style={styles.codeBox}>
              <View style={styles.codeDots}>
                <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
                <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
                <View style={[styles.dot, { backgroundColor: '#28C840' }]} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.codeText}>{lesson.codeSnippet}</Text>
              </ScrollView>
            </View>
            <Pressable
              onPress={() => navigation.navigate('Playground', {
                code: lesson!.codeSnippet!,
                language: CLASS_LANG_TO_PISTON[studentClassDetail?.language ?? ''] ?? 'python',
              })}
              style={({ pressed }) => [styles.runInPlaygroundBtn, pressed && { opacity: 0.75 }]}
            >
              <Text style={styles.runInPlaygroundText}>▶  Run in Playground</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Turn in section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Submission</Text>
          {subLoading ? (
            <ActivityIndicator color="#7C3AED" style={{ marginTop: 16 }} />
          ) : mySubmission ? (
            <View style={styles.submittedCard}>
              <View style={styles.submittedIcon}>
                <Text style={{ fontSize: 26 }}>{fileIcon(mySubmission.fileType)}</Text>
              </View>
              <View style={styles.submittedInfo}>
                <Text style={styles.submittedLabel}>Submitted</Text>
                <Text style={styles.submittedName} numberOfLines={1}>{mySubmission.fileName}</Text>
                <Text style={styles.submittedMeta}>
                  {formatFileSize(mySubmission.fileSize)} · {new Date(mySubmission.submittedAt).toLocaleDateString()}
                </Text>
              </View>
              <Pressable
                onPress={() => Linking.openURL(mySubmission.fileUrl)}
                style={styles.openBtn}
              >
                <Text style={styles.openBtnText}>Open</Text>
              </Pressable>
            </View>
          ) : null}

          {!deadlinePassed ? (
            <Pressable
              onPress={handleTurnIn}
              disabled={uploading}
              style={({ pressed }) => [{ opacity: pressed || uploading ? 0.7 : 1 }]}
            >
              <LinearGradient
                colors={mySubmission ? ['#059669', '#047857'] : ['#7C3AED', '#5B21B6']}
                style={styles.turnInBtn}
              >
                {uploading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.turnInText}>
                    {mySubmission ? '↑ Resubmit Work' : '↑ Turn In Work'}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          ) : (
            <View style={styles.deadlinePassedBanner}>
              <Text style={styles.deadlinePassedText}>
                ⏰ Deadline has passed — submissions are closed
              </Text>
            </View>
          )}
        </View>
        {/* Quiz section */}
        {quiz && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quiz</Text>
            {myQuizResult ? (
              <View style={styles.quizCard}>
                <View style={styles.quizCardTop}>
                  <Text style={styles.quizCardIcon}>
                    {myQuizResult.score >= 75 ? '🎉' : myQuizResult.score >= 50 ? '👍' : '📚'}
                  </Text>
                  <View style={styles.quizCardTextBlock}>
                    <Text style={styles.quizCardTitle}>{myQuizResult.score}% Score</Text>
                    <Text style={styles.quizCardSub}>
                      {myQuizResult.correct}/{myQuizResult.total} correct
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.quizBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => navigation.navigate('TakeQuiz', { classId, lessonId, lessonTitle: lesson!.title })}
                >
                  <Text style={styles.quizBtnText}>Retake</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => navigation.navigate('TakeQuiz', { classId, lessonId, lessonTitle: lesson!.title })}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.generateBtn}>
                  <Text style={styles.generateBtnText}>📝 Take Quiz</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Root: switches by role ───────────────────────────────────────────────────

export default function LessonDetailScreen() {
  const { user } = useAuth();
  const { params } = useRoute<any>();
  const { classId, lessonId } = params as { classId: string; lessonId: string };

  if (user?.role === UserRole.TEACHER) {
    return <TeacherLessonView classId={classId} lessonId={lessonId} />;
  }
  return <StudentLessonView classId={classId} lessonId={lessonId} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F3FF' },
  content: { paddingBottom: 48 },

  backBtn: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  backText: { color: '#7C3AED', fontSize: 15, fontWeight: '600' },

  lessonHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  orderPill: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 10,
  },
  orderPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  lessonTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', lineHeight: 30, marginBottom: 10 },
  deadlineBanner: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start',
  },
  deadlineBannerRed: { backgroundColor: 'rgba(239,68,68,0.3)' },
  deadlineBannerText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#7C3AED',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  contentText: {
    fontSize: 15, color: '#374151', lineHeight: 26,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#EDE9FE',
  },

  codeBox: {
    backgroundColor: '#1E1B2E', borderRadius: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: '#4C1D95',
  },
  codeDots: { flexDirection: 'row', gap: 6, padding: 12, paddingBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  codeText: { color: '#A5F3FC', fontFamily: 'monospace', fontSize: 13, lineHeight: 20, padding: 14, paddingTop: 0 },

  // Teacher submissions
  submissionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  submissionStats: { flexDirection: 'row' },
  statPill: {
    backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 12,
  },
  statPillText: { color: '#7C3AED', fontSize: 11, fontWeight: '700' },

  emptySubmissions: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#EDE9FE',
  },
  emptySubText: { color: '#9CA3AF', fontSize: 14 },

  notSubRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB',
    borderRadius: 14, padding: 14, marginBottom: 10, gap: 12,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  notSubAvatar: { backgroundColor: '#FEF3C7' },
  notSubAvatarText: { color: '#D97706', fontSize: 16, fontWeight: '800' },
  notSubLabel: { color: '#D97706', fontSize: 12, marginTop: 2 },
  notSubBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, borderColor: '#FDE68A',
  },
  notSubBadgeText: { color: '#D97706', fontSize: 11, fontWeight: '700' },

  subRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 14, marginBottom: 10, gap: 12,
    borderWidth: 1, borderColor: '#EDE9FE',
    shadowColor: '#7C3AED', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  subAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center',
  },
  subAvatarText: { color: '#7C3AED', fontSize: 16, fontWeight: '800' },
  subInfo: { flex: 1 },
  subName: { color: '#1F1235', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  subMeta: { color: '#6B7280', fontSize: 12, marginBottom: 2 },
  subDate: { color: '#9CA3AF', fontSize: 11 },
  viewBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center',
  },
  viewBtnText: { fontSize: 16 },

  // Student turn-in
  submittedCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5',
    borderRadius: 14, padding: 14, marginBottom: 14, gap: 12,
    borderWidth: 1, borderColor: '#6EE7B7',
  },
  submittedIcon: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  submittedInfo: { flex: 1 },
  submittedLabel: { color: '#059669', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  submittedName: { color: '#1F1235', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  submittedMeta: { color: '#6B7280', fontSize: 12 },
  openBtn: {
    backgroundColor: '#059669', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
  },
  openBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  turnInBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  turnInText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  deadlinePassedBanner: {
    backgroundColor: '#FEE2E2', borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#FCA5A5',
  },
  deadlinePassedText: { color: '#DC2626', fontSize: 14, fontWeight: '600', textAlign: 'center' },

  // Quiz
  quizCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#EDE9FE', gap: 14,
    shadowColor: '#7C3AED', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  quizCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quizCardIcon: { fontSize: 30 },
  quizCardTextBlock: { flex: 1 },
  quizCardTitle: { color: '#1F1235', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  quizCardSub: { color: '#6B7280', fontSize: 12 },
  quizActions: { flexDirection: 'row', gap: 10 },
  quizBtn: {
    backgroundColor: '#7C3AED', paddingVertical: 10, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  quizBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  quizBtnOutline: {
    borderWidth: 1.5, borderColor: '#7C3AED', paddingVertical: 10, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  quizBtnOutlineText: { color: '#7C3AED', fontSize: 13, fontWeight: '700' },
  generateBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  generateBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

  runInPlaygroundBtn: {
    marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0E0E28', borderRadius: 12, paddingVertical: 12,
    borderWidth: 1.5, borderColor: '#28C840',
  },
  runInPlaygroundText: { color: '#28C840', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
});
