import React from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { classesService, ExamAnswer } from '../../services/classes.service';
import { StudentStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';

type RoutePropType = RouteProp<StudentStackParamList, 'ExamResult'>;

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#D97706' : '#DC2626';
  return (
    <View style={[styles.ring, { borderColor: color }]}>
      <Text style={[styles.ringScore, { color }]}>{score}%</Text>
      <Text style={styles.ringLabel}>Score</Text>
    </View>
  );
}

export default function ExamResultScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RoutePropType>();
  const insets = useSafeAreaInsets();
  const { isDark, colors: tc } = useTheme();

  const bg      = isDark ? tc.background  : '#F5F3FF';
  const surface = isDark ? tc.surface     : '#FFFFFF';
  const border  = isDark ? tc.border      : '#EDE9FE';
  const txtPri  = isDark ? tc.textPrimary : '#1F1235';
  const txtMut  = isDark ? tc.textMuted   : '#6B7280';
  const labelC  = isDark ? tc.primaryLight : '#4C1D95';

  const { data: result, isLoading } = useQuery({
    queryKey: ['my-exam-result', params.classId, params.examId],
    queryFn: () => classesService.getMyExamResult(params.classId, params.examId),
  });

  const effectiveScore = (a: ExamAnswer) =>
    a.teacherScore != null ? a.teacherScore : (a.aiScore ?? 0);

  const maxFor = (qIdx: number) =>
    result?.quiz?.questions[qIdx]?.maxScore ??
    ((['mcq', 'fill', 'short'] as string[]).includes(result?.quiz?.questions[qIdx]?.type ?? '') ? 1 : 10);

  if (isLoading || !result) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const exam = result.quiz;

  return (
    <View style={[styles.safe, { backgroundColor: bg }]}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={2}>{exam.title}</Text>
        <Text style={styles.headerSub}>Exam Results</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Score hero */}
        <View style={[styles.scoreCard, { backgroundColor: surface }]}>
          <ScoreRing score={result.score} />
          <View style={styles.scoreMeta}>
            <Text style={[styles.scoreMetaTitle, { color: txtPri }]}>
              {result.score >= 80 ? 'Excellent work!' : result.score >= 60 ? 'Good effort!' : 'Keep practicing!'}
            </Text>
            <Text style={[styles.scoreMetaSub, { color: txtMut }]}>
              Auto-graded: {result.correct} / {result.total} correct
            </Text>
            <Text style={[styles.scoreMetaSub, { color: txtMut }]}>
              Submitted {new Date(result.completedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Per-question breakdown */}
        <Text style={[styles.sectionTitle, { color: labelC }]}>Question Breakdown</Text>

        {result.answers.map((a, i) => {
          const q = exam.questions[a.questionIndex];
          if (!q) return null;
          const max = maxFor(a.questionIndex);
          const earned = effectiveScore(a);
          const pct = max > 0 ? earned / max : 0;
          const scoreColor = pct >= 0.6 ? '#059669' : '#DC2626';
          const hasTeacherOverride = a.teacherScore != null;

          return (
            <View key={i} style={[styles.qCard, { backgroundColor: surface, borderColor: border }]}>
              <View style={styles.qCardTop}>
                <View style={styles.qCardLeft}>
                  <Text style={[styles.qNum, { color: '#7C3AED' }]}>Q{a.questionIndex + 1}</Text>
                  <View style={styles.qTypePill}>
                    <Text style={styles.qTypePillText}>{q.type}</Text>
                  </View>
                </View>
                <Text style={[styles.qScoreText, { color: scoreColor }]}>
                  {earned}/{max}{hasTeacherOverride ? ' ✏️' : ''}
                </Text>
              </View>

              <Text style={[styles.qText, { color: txtPri }]}>{q.question}</Text>

              <Text style={[styles.answerLabel, { color: txtMut }]}>Your Answer:</Text>
              <Text style={[styles.answerText, { color: txtPri }]}>{a.answer || '(no answer)'}</Text>

              {/* AI Feedback */}
              {a.aiFeedback && (
                <View style={[styles.feedbackBox, { backgroundColor: pct >= 0.6 ? '#F0FDF4' : '#FEF2F2' }]}>
                  <Text style={[styles.feedbackLabel, { color: pct >= 0.6 ? '#065F46' : '#991B1B' }]}>
                    {hasTeacherOverride ? 'AI Feedback (revised by teacher)' : 'AI Feedback'}
                  </Text>
                  <Text style={[styles.feedbackText, { color: pct >= 0.6 ? '#064E3B' : '#7F1D1D' }]}>
                    {a.aiFeedback}
                  </Text>
                </View>
              )}

              {/* Teacher override note */}
              {a.teacherNote ? (
                <View style={[styles.feedbackBox, { backgroundColor: '#EDE9FE' }]}>
                  <Text style={[styles.feedbackLabel, { color: '#5B21B6' }]}>Teacher Note</Text>
                  <Text style={[styles.feedbackText, { color: '#4C1D95' }]}>{a.teacherNote}</Text>
                </View>
              ) : null}

              {/* Expected answer (for MCQ/fill only) */}
              {(q.type === 'mcq' || q.type === 'fill') && pct < 1 && (
                <Text style={[styles.expectedText, { color: txtMut }]}>
                  Expected: <Text style={{ color: '#059669', fontWeight: '700' }}>{q.answer}</Text>
                </Text>
              )}
            </View>
          );
        })}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { paddingBottom: 20, paddingHorizontal: 20, gap: 4 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600', marginBottom: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },

  content: { padding: 16 },

  scoreCard: {
    flexDirection: 'row', alignItems: 'center', gap: 20,
    borderRadius: 18, padding: 20, marginBottom: 24,
    shadowColor: '#7C3AED', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  ring: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 5,
    justifyContent: 'center', alignItems: 'center',
  },
  ringScore: { fontSize: 22, fontWeight: '900' },
  ringLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  scoreMeta: { flex: 1 },
  scoreMetaTitle: { fontSize: 17, fontWeight: '800', marginBottom: 6 },
  scoreMetaSub: { fontSize: 13, marginBottom: 3 },

  sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },

  qCard: {
    borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#7C3AED', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  qCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  qCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qNum: { fontSize: 13, fontWeight: '800' },
  qTypePill: { backgroundColor: '#DDD6FE', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  qTypePillText: { fontSize: 11, fontWeight: '700', color: '#5B21B6' },
  qScoreText: { fontSize: 14, fontWeight: '800' },
  qText: { fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 10 },

  answerLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  answerText: { fontSize: 13, lineHeight: 19, marginBottom: 8 },

  feedbackBox: { borderRadius: 10, padding: 10, marginBottom: 8 },
  feedbackLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  feedbackText: { fontSize: 13, lineHeight: 18 },

  expectedText: { fontSize: 12, marginTop: 4 },
});
