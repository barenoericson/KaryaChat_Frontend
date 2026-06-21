import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { classesService, ExamResult, ExamAnswer } from '../../services/classes.service';
import { TeacherStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';

type RoutePropType = RouteProp<TeacherStackParamList, 'ExamResults'>;

function scoreBadgeColor(score: number) {
  if (score >= 80) return { bg: '#D1FAE5', text: '#065F46' };
  if (score >= 60) return { bg: '#FEF3C7', text: '#92400E' };
  return { bg: '#FEE2E2', text: '#991B1B' };
}

export default function ExamResultsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RoutePropType>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { isDark, colors: tc } = useTheme();

  const bg      = isDark ? tc.background  : '#F5F3FF';
  const surface = isDark ? tc.surface     : '#FFFFFF';
  const border  = isDark ? tc.border      : '#EDE9FE';
  const txtPri  = isDark ? tc.textPrimary : '#1F1235';
  const txtMut  = isDark ? tc.textMuted   : '#6B7280';
  const labelC  = isDark ? tc.primaryLight : '#4C1D95';

  const [expanded, setExpanded] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Record<number, { score: string; note: string }>>>({});

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['exam-results', params.classId, params.examId],
    queryFn: () => classesService.getExamResults(params.classId, params.examId),
  });

  const { data: exam } = useQuery({
    queryKey: ['exam', params.classId, params.examId],
    queryFn: () => classesService.getExam(params.classId, params.examId),
  });

  const { mutate: saveOverrides, isPending: saving } = useMutation({
    mutationFn: (resultId: string) => {
      const resultOverrides = overrides[resultId] ?? {};
      const payload = Object.entries(resultOverrides).map(([idx, val]) => ({
        questionIndex: Number(idx),
        score: Number(val.score) || 0,
        note: val.note,
      }));
      return classesService.overrideGrades(params.classId, params.examId, resultId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results', params.classId, params.examId] });
      Alert.alert('Saved', 'Grades updated successfully.');
    },
    onError: () => Alert.alert('Error', 'Failed to save grades.'),
  });

  const setOverride = (resultId: string, qIdx: number, field: 'score' | 'note', value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [resultId]: {
        ...(prev[resultId] ?? {}),
        [qIdx]: {
          score: (prev[resultId]?.[qIdx]?.score ?? ''),
          note:  (prev[resultId]?.[qIdx]?.note  ?? ''),
          [field]: value,
        },
      },
    }));
  };

  const effectiveScore = (a: ExamAnswer) =>
    a.teacherScore != null ? a.teacherScore : (a.aiScore ?? 0);

  const maxScore = (qIdx: number) =>
    exam?.questions[qIdx]?.maxScore ??
    ((['mcq', 'fill', 'short'] as string[]).includes(exam?.questions[qIdx]?.type ?? '') ? 1 : 10);

  return (
    <View style={[styles.safe, { backgroundColor: bg }]}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={2}>{params.examTitle}</Text>
        <Text style={styles.headerSub}>{results.length} submission{results.length !== 1 ? 's' : ''}</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>📋</Text>
          <Text style={[styles.emptyTitle, { color: txtPri }]}>No submissions yet</Text>
          <Text style={[styles.emptyDesc, { color: txtMut }]}>Students haven't submitted this exam yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {results.map((result) => {
            const badge = scoreBadgeColor(result.score);
            const isOpen = expanded === result.id;

            return (
              <View key={result.id} style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
                {/* Summary row */}
                <Pressable style={styles.summaryRow} onPress={() => setExpanded(isOpen ? null : result.id)}>
                  <View style={[styles.avatar, { backgroundColor: '#EDE9FE' }]}>
                    <Text style={styles.avatarText}>
                      {result.student.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.studentName, { color: txtPri }]}>{result.student.username}</Text>
                    <Text style={[styles.studentSub, { color: txtMut }]}>
                      {new Date(result.completedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[styles.scoreBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.scoreText, { color: badge.text }]}>{result.score}%</Text>
                  </View>
                  <Text style={[styles.chevron, { color: txtMut }]}>{isOpen ? '▲' : '▼'}</Text>
                </Pressable>

                {/* Expanded detail */}
                {isOpen && exam && (
                  <View style={styles.detail}>
                    {result.answers.map((a, i) => {
                      const q = exam.questions[a.questionIndex];
                      if (!q) return null;
                      const hasOverride = overrides[result.id]?.[a.questionIndex];
                      const displayScore = hasOverride
                        ? Number(overrides[result.id][a.questionIndex].score) || 0
                        : effectiveScore(a);
                      const max = maxScore(a.questionIndex);
                      const isTeacherOverridden = a.teacherScore != null;

                      return (
                        <View key={i} style={[styles.qBlock, { borderTopColor: border }]}>
                          <View style={styles.qBlockHeader}>
                            <Text style={[styles.qLabel, { color: labelC }]}>
                              Q{a.questionIndex + 1} · {q.type}
                            </Text>
                            <Text style={[styles.qScore, { color: displayScore / max >= 0.6 ? '#059669' : '#DC2626' }]}>
                              {displayScore}/{max}
                              {isTeacherOverridden && !hasOverride ? ' ✏️' : ''}
                            </Text>
                          </View>

                          <Text style={[styles.qText, { color: txtPri }]}>{q.question}</Text>

                          <Text style={[styles.answerLabel, { color: txtMut }]}>Student Answer:</Text>
                          <Text style={[styles.answerText, { color: txtPri }]}>{a.answer || '(no answer)'}</Text>

                          {a.aiFeedback && (
                            <View style={styles.aiFeedback}>
                              <Text style={styles.aiFeedbackLabel}>AI Feedback:</Text>
                              <Text style={styles.aiFeedbackText}>{a.aiFeedback}</Text>
                            </View>
                          )}

                          {a.teacherNote && !hasOverride && (
                            <View style={[styles.aiFeedback, { backgroundColor: '#EDE9FE' }]}>
                              <Text style={[styles.aiFeedbackLabel, { color: '#6D28D9' }]}>Teacher Note:</Text>
                              <Text style={[styles.aiFeedbackText, { color: '#4C1D95' }]}>{a.teacherNote}</Text>
                            </View>
                          )}

                          {/* Override inputs */}
                          <Text style={[styles.overrideLabel, { color: labelC }]}>Override Score (0–{max})</Text>
                          <View style={styles.overrideRow}>
                            <TextInput
                              style={[styles.overrideInput, { backgroundColor: bg, borderColor: border, color: txtPri }]}
                              value={overrides[result.id]?.[a.questionIndex]?.score ?? String(effectiveScore(a))}
                              onChangeText={(v) => setOverride(result.id, a.questionIndex, 'score', v)}
                              keyboardType="numeric"
                              maxLength={4}
                            />
                            <TextInput
                              style={[styles.overrideNote, { backgroundColor: bg, borderColor: border, color: txtPri }]}
                              placeholder="Note (optional)"
                              placeholderTextColor={txtMut}
                              value={overrides[result.id]?.[a.questionIndex]?.note ?? (a.teacherNote ?? '')}
                              onChangeText={(v) => setOverride(result.id, a.questionIndex, 'note', v)}
                            />
                          </View>
                        </View>
                      );
                    })}

                    <Pressable
                      style={({ pressed }) => [{ opacity: pressed || saving ? 0.7 : 1, marginTop: 12 }]}
                      onPress={() => saveOverrides(result.id)}
                      disabled={saving}
                    >
                      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.saveBtn}>
                        {saving
                          ? <ActivityIndicator color="#fff" size="small" />
                          : <Text style={styles.saveBtnText}>Save Grade Overrides</Text>
                        }
                      </LinearGradient>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  header: { paddingBottom: 20, paddingHorizontal: 20, gap: 6 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600', marginBottom: 10 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },

  content: { padding: 16 },

  card: { borderWidth: 1.5, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#7C3AED', fontSize: 16, fontWeight: '800' },
  studentName: { fontSize: 15, fontWeight: '700' },
  studentSub: { fontSize: 12, marginTop: 2 },
  scoreBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  scoreText: { fontSize: 14, fontWeight: '800' },
  chevron: { fontSize: 12, marginLeft: 4 },

  detail: { borderTopWidth: 1, borderTopColor: '#EDE9FE', padding: 14 },

  qBlock: { paddingTop: 14, marginTop: 14, borderTopWidth: 1 },
  qBlockHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  qLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  qScore: { fontSize: 13, fontWeight: '800' },
  qText: { fontSize: 14, fontWeight: '600', marginBottom: 10, lineHeight: 20 },

  answerLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  answerText: { fontSize: 13, lineHeight: 19, marginBottom: 8 },

  aiFeedback: { backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10, marginBottom: 8 },
  aiFeedbackLabel: { fontSize: 11, fontWeight: '700', color: '#065F46', marginBottom: 3 },
  aiFeedbackText: { fontSize: 13, color: '#064E3B', lineHeight: 18 },

  overrideLabel: { fontSize: 11, fontWeight: '700', marginTop: 8, marginBottom: 6 },
  overrideRow: { flexDirection: 'row', gap: 8 },
  overrideInput: {
    width: 70, borderWidth: 1.5, borderRadius: 10, padding: 9, fontSize: 14, textAlign: 'center',
  },
  overrideNote: {
    flex: 1, borderWidth: 1.5, borderRadius: 10, padding: 9, fontSize: 13,
  },

  saveBtn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center' },
});
