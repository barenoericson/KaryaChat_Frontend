import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { classesService, ExamQuestion } from '../../services/classes.service';
import { StudentStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';

type NavProp = StackNavigationProp<StudentStackParamList, 'TakeExam'>;
type RoutePropType = RouteProp<StudentStackParamList, 'TakeExam'>;

function QBlock({
  idx, q, answer, onChange,
}: {
  idx: number;
  q: ExamQuestion;
  answer: string;
  onChange: (v: string) => void;
}) {
  const { isDark, colors: tc } = useTheme();
  const bg     = isDark ? tc.surfaceAlt  : '#F5F3FF';
  const border = isDark ? tc.border      : '#DDD6FE';
  const txtPri = isDark ? tc.textPrimary : '#1F1235';
  const txtMut = isDark ? tc.textMuted   : '#6B7280';
  const labelC = isDark ? tc.primaryLight : '#4C1D95';

  const TYPE_LABELS: Record<ExamQuestion['type'], string> = {
    mcq: 'Multiple Choice', fill: 'Fill in Blank', short: 'Short Answer',
    coding: 'Coding', 'open-ended': 'Open-ended', essay: 'Essay',
  };

  return (
    <View style={[styles.qBlock, { backgroundColor: bg }]}>
      <View style={styles.qHeader}>
        <Text style={[styles.qNum, { color: '#7C3AED' }]}>Q{idx + 1}</Text>
        <View style={styles.qTypePill}>
          <Text style={styles.qTypePillText}>{TYPE_LABELS[q.type]}</Text>
        </View>
        <Text style={[styles.qPts, { color: txtMut }]}>{q.maxScore ?? (q.type === 'mcq' ? 1 : 10)} pts</Text>
      </View>

      <Text style={[styles.qText, { color: txtPri }]}>{q.question}</Text>

      {q.type === 'mcq' && q.options ? (
        <View style={styles.optionsCol}>
          {q.options.map((opt, oi) => {
            const selected = answer === opt;
            return (
              <Pressable
                key={oi}
                style={({ pressed }) => [
                  styles.option,
                  { borderColor: selected ? '#7C3AED' : border },
                  selected && { backgroundColor: '#EDE9FE' },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => onChange(opt)}
              >
                <View style={[styles.optionCircle, selected && { backgroundColor: '#7C3AED', borderColor: '#7C3AED' }]}>
                  {selected && <View style={styles.optionDot} />}
                </View>
                <Text style={[styles.optionText, { color: txtPri }]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <TextInput
          style={[
            styles.answerInput,
            { backgroundColor: isDark ? tc.surface : '#FFFFFF', borderColor: border, color: txtPri },
            (q.type === 'essay' || q.type === 'coding') && styles.answerInputTall,
          ]}
          placeholder={
            q.type === 'coding'
              ? 'Write your code here...'
              : q.type === 'essay'
              ? 'Write your essay here...'
              : 'Your answer...'
          }
          placeholderTextColor={txtMut}
          value={answer}
          onChangeText={onChange}
          multiline
          textAlignVertical="top"
        />
      )}
    </View>
  );
}

export default function TakeExamScreen() {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<RoutePropType>();
  const insets = useSafeAreaInsets();
  const { isDark, colors: tc } = useTheme();

  const bg     = isDark ? tc.background  : '#F5F3FF';
  const txtPri = isDark ? tc.textPrimary : '#1F1235';
  const txtMut = isDark ? tc.textMuted   : '#6B7280';

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const { data: exam, isLoading } = useQuery({
    queryKey: ['exam', params.classId, params.examId],
    queryFn: () => classesService.getExam(params.classId, params.examId),
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => {
      if (!exam) throw new Error('Exam not loaded');
      const missing = exam.questions.findIndex((_, i) => !answers[i]?.trim());
      if (missing !== -1) {
        throw new Error(`Please answer Question ${missing + 1} before submitting.`);
      }
      return classesService.submitExam(
        params.classId,
        params.examId,
        exam.questions.map((_, i) => ({ questionIndex: i, answer: answers[i] ?? '' })),
      );
    },
    onSuccess: () => {
      navigation.replace('ExamResult', { classId: params.classId, examId: params.examId });
    },
    onError: (err: any) => Alert.alert('Cannot Submit', err?.message ?? 'Please check your answers.'),
  });

  const confirmSubmit = () => {
    Alert.alert(
      'Submit Exam',
      'Once submitted you cannot change your answers. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => submit() },
      ],
    );
  };

  if (isLoading || !exam) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: bg }]}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={2}>{exam.title}</Text>
        <Text style={styles.headerSub}>{exam.questions.length} question{exam.questions.length !== 1 ? 's' : ''}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Rubric notice */}
        <View style={styles.rubricBox}>
          <Text style={styles.rubricLabel}>Grading Rubric</Text>
          <Text style={[styles.rubricText, { color: txtPri }]}>{exam.rubric}</Text>
        </View>

        {exam.questions.map((q, i) => (
          <QBlock
            key={i}
            idx={i}
            q={q}
            answer={answers[i] ?? ''}
            onChange={(v) => setAnswers((prev) => ({ ...prev, [i]: v }))}
          />
        ))}

        {/* Progress indicator */}
        <Text style={[styles.progressText, { color: txtMut }]}>
          {Object.values(answers).filter((a) => a.trim()).length} / {exam.questions.length} answered
        </Text>

        <Pressable
          style={({ pressed }) => [{ opacity: pressed || isPending ? 0.7 : 1 }]}
          onPress={confirmSubmit}
          disabled={isPending}
        >
          <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.submitBtn}>
            {isPending
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>Submit Exam</Text>
            }
          </LinearGradient>
        </Pressable>

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

  rubricBox: {
    backgroundColor: '#EDE9FE', borderRadius: 14, padding: 14,
    marginBottom: 18, borderLeftWidth: 4, borderLeftColor: '#7C3AED',
  },
  rubricLabel: { fontSize: 11, fontWeight: '800', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  rubricText: { fontSize: 13, lineHeight: 19 },

  qBlock: { borderRadius: 14, padding: 14, marginBottom: 14 },
  qHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  qNum: { fontSize: 14, fontWeight: '800', minWidth: 24 },
  qTypePill: { backgroundColor: '#DDD6FE', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  qTypePillText: { fontSize: 11, fontWeight: '700', color: '#5B21B6' },
  qPts: { fontSize: 12, marginLeft: 'auto' as any },
  qText: { fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 12 },

  optionsCol: { gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderRadius: 12, padding: 12,
    backgroundColor: 'transparent',
  },
  optionCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: '#C4B5FD', justifyContent: 'center', alignItems: 'center',
  },
  optionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  optionText: { fontSize: 14, flex: 1 },

  answerInput: {
    borderWidth: 1.5, borderRadius: 12, padding: 12,
    fontSize: 14, minHeight: 60, textAlignVertical: 'top',
  },
  answerInputTall: { minHeight: 140 },

  progressText: { textAlign: 'center', fontSize: 13, fontWeight: '600', marginVertical: 14 },

  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
