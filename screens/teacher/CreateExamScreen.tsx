import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { classesService, ExamQuestion } from '../../services/classes.service';
import { TeacherStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';

type RoutePropType = RouteProp<TeacherStackParamList, 'CreateExam'>;

type QType = ExamQuestion['type'];

const QTYPES: { id: QType; label: string; emoji: string; defaultMax: number }[] = [
  { id: 'mcq',         label: 'Multiple Choice', emoji: '🔘', defaultMax: 2  },
  { id: 'coding',      label: 'Coding',          emoji: '💻', defaultMax: 10 },
  { id: 'open-ended',  label: 'Open-ended',      emoji: '✍️',  defaultMax: 10 },
  { id: 'essay',       label: 'Essay',           emoji: '📝', defaultMax: 20 },
  { id: 'fill',        label: 'Fill in Blank',   emoji: '✏️',  defaultMax: 1  },
  { id: 'short',       label: 'Short Answer',    emoji: '📖', defaultMax: 5  },
];

interface DraftQuestion extends ExamQuestion {
  _key: number;
}

const blankDraft = (type: QType, key: number): DraftQuestion => ({
  _key: key,
  type,
  question: '',
  answer: '',
  options: type === 'mcq' ? ['', '', '', ''] : undefined,
  maxScore: QTYPES.find((q) => q.id === type)?.defaultMax ?? 5,
});

export default function CreateExamScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RoutePropType>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { isDark, colors: tc } = useTheme();

  const bg      = isDark ? tc.background  : '#F5F3FF';
  const surface = isDark ? tc.surface     : '#FFFFFF';
  const border  = isDark ? tc.border      : '#DDD6FE';
  const txtPri  = isDark ? tc.textPrimary : '#1F1235';
  const txtMut  = isDark ? tc.textMuted   : '#6B7280';
  const labelC  = isDark ? tc.primaryLight : '#4C1D95';

  const [title, setTitle] = useState('');
  const [rubric, setRubric] = useState('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [counter, setCounter] = useState(0);
  const [addingType, setAddingType] = useState<QType | null>(null);
  const [draft, setDraft] = useState<DraftQuestion | null>(null);

  const startAdd = (type: QType) => {
    setAddingType(type);
    setDraft(blankDraft(type, counter));
    setCounter((c) => c + 1);
  };

  const cancelAdd = () => { setAddingType(null); setDraft(null); };

  const confirmAdd = () => {
    if (!draft) return;
    if (!draft.question.trim()) return Alert.alert('Required', 'Question text is required.');
    if (!draft.answer.trim()) return Alert.alert('Required', 'Answer/sample answer is required.');
    if (draft.type === 'mcq') {
      const opts = draft.options ?? [];
      if (opts.some((o) => !o.trim())) return Alert.alert('Required', 'Fill in all 4 options.');
      if (!opts.includes(draft.answer.trim())) {
        return Alert.alert('Required', 'Correct answer must match one of the options exactly.');
      }
    }
    setQuestions((prev) => [...prev, { ...draft, answer: draft.answer.trim() }]);
    setAddingType(null);
    setDraft(null);
  };

  const removeQuestion = (key: number) =>
    setQuestions((prev) => prev.filter((q) => q._key !== key));

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      if (!title.trim()) throw new Error('Title is required');
      if (!rubric.trim()) throw new Error('Rubric is required');
      if (questions.length === 0) throw new Error('Add at least one question');
      return classesService.createExam(params.classId, {
        title: title.trim(),
        rubric: rubric.trim(),
        questions: questions.map(({ _key, ...q }) => q),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', params.classId] });
      navigation.goBack();
    },
    onError: (err: any) => Alert.alert('Error', err?.message ?? 'Failed to create exam.'),
  });

  const qLabel = (type: QType) => QTYPES.find((q) => q.id === type)?.label ?? type;
  const qEmoji = (type: QType) => QTYPES.find((q) => q.id === type)?.emoji ?? '❓';

  return (
    <View style={[styles.safe, { backgroundColor: bg }]}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Create Exam</Text>
        <Text style={styles.headerSub}>Add questions and a grading rubric</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Title */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: labelC }]}>Exam Title <Text style={styles.req}>*</Text></Text>
          <TextInput
            style={[styles.input, { backgroundColor: surface, borderColor: border, color: txtPri }]}
            placeholder="e.g. Midterm Exam — Python Basics"
            placeholderTextColor={txtMut}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />
        </View>

        {/* Rubric */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: labelC }]}>Grading Rubric <Text style={styles.req}>*</Text></Text>
          <Text style={[styles.hint, { color: txtMut }]}>
            Describe how AI should grade open-ended, essay, and coding questions.
          </Text>
          <TextInput
            style={[styles.input, styles.tall, { backgroundColor: surface, borderColor: border, color: txtPri }]}
            placeholder="e.g. Award full marks for correct logic and clean code. Deduct 30% for missing edge cases. Essay responses should be at least 3 sentences."
            placeholderTextColor={txtMut}
            value={rubric}
            onChangeText={setRubric}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Questions list */}
        {questions.length > 0 && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: labelC }]}>Questions ({questions.length})</Text>
            {questions.map((q, idx) => (
              <View key={q._key} style={[styles.qCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={styles.qCardHeader}>
                  <Text style={[styles.qNum, { color: '#7C3AED' }]}>Q{idx + 1}</Text>
                  <View style={[styles.qTypeBadge, { backgroundColor: '#EDE9FE' }]}>
                    <Text style={styles.qTypeText}>{qEmoji(q.type)} {qLabel(q.type)}</Text>
                  </View>
                  <Text style={[styles.qMax, { color: txtMut }]}>{q.maxScore} pts</Text>
                  <Pressable onPress={() => removeQuestion(q._key)} hitSlop={8}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </Pressable>
                </View>
                <Text style={[styles.qText, { color: txtPri }]} numberOfLines={2}>{q.question}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Add question form */}
        {draft && addingType ? (
          <View style={[styles.draftCard, { backgroundColor: surface, borderColor: '#7C3AED' }]}>
            <Text style={[styles.draftTitle, { color: labelC }]}>
              {qEmoji(addingType)} {qLabel(addingType)} Question
            </Text>

            <Text style={[styles.draftLabel, { color: labelC }]}>Question <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.med, { backgroundColor: bg, borderColor: border, color: txtPri }]}
              placeholder="Enter the question..."
              placeholderTextColor={txtMut}
              value={draft.question}
              onChangeText={(t) => setDraft((d) => d && ({ ...d, question: t }))}
              multiline
              textAlignVertical="top"
            />

            {draft.type === 'mcq' && (
              <>
                <Text style={[styles.draftLabel, { color: labelC }]}>Options</Text>
                {(draft.options ?? ['', '', '', '']).map((opt, i) => (
                  <TextInput
                    key={i}
                    style={[styles.input, { backgroundColor: bg, borderColor: border, color: txtPri, marginBottom: 8 }]}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    placeholderTextColor={txtMut}
                    value={opt}
                    onChangeText={(t) => {
                      const opts = [...(draft.options ?? ['', '', '', ''])];
                      opts[i] = t;
                      setDraft((d) => d && ({ ...d, options: opts }));
                    }}
                  />
                ))}
                <Text style={[styles.draftLabel, { color: labelC }]}>Correct Answer (paste option exactly)</Text>
              </>
            )}

            {draft.type !== 'mcq' && (
              <Text style={[styles.draftLabel, { color: labelC }]}>
                {draft.type === 'coding' ? 'Sample Solution' : 'Expected / Sample Answer'}
              </Text>
            )}
            <TextInput
              style={[styles.input, styles.med, { backgroundColor: bg, borderColor: border, color: txtPri }]}
              placeholder={draft.type === 'mcq' ? 'Paste the correct option text exactly' : 'Expected answer or sample solution…'}
              placeholderTextColor={txtMut}
              value={draft.answer}
              onChangeText={(t) => setDraft((d) => d && ({ ...d, answer: t }))}
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.draftLabel, { color: labelC }]}>Points (max score)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: bg, borderColor: border, color: txtPri, width: 90 }]}
              value={String(draft.maxScore ?? '')}
              onChangeText={(t) => setDraft((d) => d && ({ ...d, maxScore: parseInt(t) || 0 }))}
              keyboardType="numeric"
              maxLength={4}
            />

            <View style={styles.draftActions}>
              <Pressable style={styles.cancelBtn} onPress={cancelAdd}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={confirmAdd}>
                <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.addConfirmBtn}>
                  <Text style={styles.addConfirmText}>Add Question</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.field}>
            <Text style={[styles.label, { color: labelC }]}>Add Question</Text>
            <View style={styles.qTypeGrid}>
              {QTYPES.map((qt) => (
                <Pressable
                  key={qt.id}
                  style={({ pressed }) => [styles.qTypeChip, { backgroundColor: surface, borderColor: border }, pressed && { opacity: 0.7 }]}
                  onPress={() => startAdd(qt.id)}
                >
                  <Text style={styles.qTypeChipEmoji}>{qt.emoji}</Text>
                  <Text style={[styles.qTypeChipLabel, { color: labelC }]}>{qt.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Pressable
          onPress={() => save()}
          disabled={isPending}
          style={({ pressed }) => [{ opacity: pressed || isPending ? 0.7 : 1, marginTop: 8 }]}
        >
          <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.saveBtn}>
            {isPending
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Save Exam</Text>
            }
          </LinearGradient>
        </Pressable>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingBottom: 24, paddingHorizontal: 20 },
  backBtn: { marginBottom: 14 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },

  scroll: { flex: 1 },
  content: { padding: 20 },

  field: { marginBottom: 22 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  req: { color: '#EF4444' },
  hint: { fontSize: 12, marginBottom: 8, lineHeight: 17 },

  input: {
    borderWidth: 1.5, borderRadius: 12, padding: 13,
    fontSize: 14, marginBottom: 0,
  },
  tall: { height: 120, textAlignVertical: 'top' },
  med:  { height: 80,  textAlignVertical: 'top', marginBottom: 10 },

  qCard: { borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 10 },
  qCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  qNum: { fontSize: 13, fontWeight: '800', minWidth: 22 },
  qTypeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  qTypeText: { fontSize: 11, fontWeight: '700', color: '#6D28D9' },
  qMax: { fontSize: 11, marginLeft: 'auto' as any },
  removeBtn: { fontSize: 14, color: '#EF4444', fontWeight: '700' },
  qText: { fontSize: 13, lineHeight: 18 },

  draftCard: { borderWidth: 2, borderRadius: 14, padding: 16, marginBottom: 22 },
  draftTitle: { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  draftLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  draftActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  cancelBtnText: { color: '#6B7280', fontWeight: '700', fontSize: 14 },
  addConfirmBtn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center' },
  addConfirmText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  qTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  qTypeChip: {
    width: '47%', borderWidth: 1.5, borderRadius: 12, padding: 12,
    alignItems: 'center', gap: 6,
  },
  qTypeChipEmoji: { fontSize: 22 },
  qTypeChipLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
