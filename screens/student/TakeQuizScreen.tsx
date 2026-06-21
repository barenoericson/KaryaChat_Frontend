import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, ActivityIndicator,
  StyleSheet, Alert, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { quizzesService, QuizQuestion, SubmittedAnswer } from '../../services/quizzes.service';
import { StudentStackParamList } from '../../navigation/types';

type RoutePropType = RouteProp<StudentStackParamList, 'TakeQuiz'>;

function MCQQuestion({
  question, index, selected, onSelect,
}: {
  question: QuizQuestion; index: number; selected: string; onSelect: (a: string) => void;
}) {
  return (
    <View style={styles.qCard}>
      <View style={styles.qHeader}>
        <View style={styles.qNumBadge}><Text style={styles.qNumText}>Q{index + 1}</Text></View>
        <View style={styles.qTypeBadge}><Text style={styles.qTypeText}>Multiple Choice</Text></View>
      </View>
      <Text style={styles.qText}>{question.question}</Text>
      {(question.options ?? []).map((opt, i) => {
        const isSelected = selected === opt;
        return (
          <Pressable
            key={i}
            style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
            onPress={() => onSelect(opt)}
          >
            <View style={[styles.optionCircle, isSelected && styles.optionCircleSelected]}>
              <Text style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
                {String.fromCharCode(65 + i)}
              </Text>
            </View>
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TextQuestion({
  question, index, value, onChange, typeLabel,
}: {
  question: QuizQuestion; index: number; value: string; onChange: (v: string) => void; typeLabel: string;
}) {
  return (
    <View style={styles.qCard}>
      <View style={styles.qHeader}>
        <View style={styles.qNumBadge}><Text style={styles.qNumText}>Q{index + 1}</Text></View>
        <View style={styles.qTypeBadge}><Text style={styles.qTypeText}>{typeLabel}</Text></View>
      </View>
      <Text style={styles.qText}>{question.question}</Text>
      <TextInput
        style={styles.textAnswer}
        placeholder="Type your answer here…"
        placeholderTextColor="#A78BCC"
        value={value}
        onChangeText={onChange}
        multiline={question.type === 'short'}
        textAlignVertical={question.type === 'short' ? 'top' : 'auto'}
      />
    </View>
  );
}

function ResultView({
  correct, total, score, answers, questions, onClose,
}: {
  correct: number; total: number; score: number;
  answers: SubmittedAnswer[]; questions: QuizQuestion[];
  onClose: () => void;
}) {
  const color = score >= 75 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626';
  const emoji = score >= 75 ? '🎉' : score >= 50 ? '👍' : '📚';
  const msg = score >= 75 ? 'Great job!' : score >= 50 ? 'Good effort!' : 'Keep studying!';

  return (
    <ScrollView contentContainerStyle={styles.resultContainer}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.resultHeader}>
        <Text style={styles.resultEmoji}>{emoji}</Text>
        <Text style={styles.resultTitle}>{msg}</Text>
        <View style={[styles.scoreBig, { borderColor: 'rgba(255,255,255,0.4)' }]}>
          <Text style={[styles.scoreNum, { color: '#FFFFFF' }]}>{score}%</Text>
          <Text style={styles.scoreLabel}>{correct} / {total} correct</Text>
        </View>
      </LinearGradient>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>Answer Review</Text>
        {questions.map((q, i) => {
          const submitted = answers.find((a) => a.questionIndex === i)?.answer ?? '';
          const isCorrect = submitted.trim().toLowerCase() === q.answer.trim().toLowerCase();
          return (
            <View key={i} style={[styles.reviewCard, isCorrect ? styles.reviewCorrect : styles.reviewWrong]}>
              <Text style={styles.reviewQNum}>Q{i + 1}</Text>
              <Text style={styles.reviewQ}>{q.question}</Text>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewYourLabel}>Your answer: </Text>
                <Text style={[styles.reviewAnswer, isCorrect ? styles.correctText : styles.wrongText]}>
                  {submitted || '(no answer)'}
                </Text>
              </View>
              {!isCorrect && (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewYourLabel}>Correct: </Text>
                  <Text style={styles.correctText}>{q.answer}</Text>
                </View>
              )}
              {q.explanation && (
                <Text style={styles.reviewExplanation}>{q.explanation}</Text>
              )}
            </View>
          );
        })}
      </View>

      <Pressable onPress={onClose} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, marginHorizontal: 20, marginBottom: 40 }]}>
        <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.doneBtn}>
          <Text style={styles.doneBtnText}>Done</Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

export default function TakeQuizScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RoutePropType>();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number; score: number; answers: SubmittedAnswer[] } | null>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', params.classId, params.lessonId],
    queryFn: () => quizzesService.getQuiz(params.classId, params.lessonId),
  });

  const { mutate: submitQuiz, isPending } = useMutation({
    mutationFn: () => {
      const payload: SubmittedAnswer[] = (quiz?.questions ?? []).map((_, i) => ({
        questionIndex: i,
        answer: answers[i] ?? '',
      }));
      return quizzesService.submit(params.classId, params.lessonId, payload);
    },
    onSuccess: (res) => {
      const payload: SubmittedAnswer[] = (quiz?.questions ?? []).map((_, i) => ({
        questionIndex: i,
        answer: answers[i] ?? '',
      }));
      setResult({ correct: res.correct, total: res.total, score: res.score, answers: payload });
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['quiz-my-result', params.classId, params.lessonId] });
    },
    onError: () => Alert.alert('Error', 'Failed to submit quiz. Please try again.'),
  });

  const handleSubmit = () => {
    if (!quiz) return;
    const unanswered = quiz.questions.filter((_, i) => !answers[i]?.trim()).length;
    if (unanswered > 0) {
      Alert.alert(
        'Unanswered Questions',
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`,
        [
          { text: 'Review', style: 'cancel' },
          { text: 'Submit', onPress: () => submitQuiz() },
        ],
      );
    } else {
      submitQuiz();
    }
  };

  if (isLoading || !quiz) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color="#7C3AED" /></View>
      </SafeAreaView>
    );
  }

  if (submitted && result) {
    return (
      <SafeAreaView style={styles.safe}>
        <ResultView
          correct={result.correct}
          total={result.total}
          score={result.score}
          answers={result.answers}
          questions={quiz.questions}
          onClose={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const answered = Object.values(answers).filter((a) => a.trim()).length;
  const canSubmit = !isPending;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Quiz</Text>
        <Text style={styles.headerSub} numberOfLines={1}>{params.lessonTitle}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{answered} / {quiz.questions.length} answered</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${(answered / quiz.questions.length) * 100}%` as any }]} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.questionList}>
        {quiz.questions.map((q, i) => {
          if (q.type === 'mcq') {
            return (
              <MCQQuestion
                key={i} question={q} index={i}
                selected={answers[i] ?? ''}
                onSelect={(a) => setAnswers((prev) => ({ ...prev, [i]: a }))}
              />
            );
          }
          return (
            <TextQuestion
              key={i} question={q} index={i}
              value={answers[i] ?? ''}
              onChange={(v) => setAnswers((prev) => ({ ...prev, [i]: v }))}
              typeLabel={q.type === 'fill' ? 'Fill in the Blank' : 'Short Answer'}
            />
          );
        })}

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [{ opacity: pressed || !canSubmit ? 0.7 : 1, marginTop: 8 }]}
        >
          <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.submitBtn}>
            {isPending
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.submitText}>Submit Quiz</Text>
            }
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { paddingTop: 12, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 2 },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 12 },
  progressRow: { gap: 6 },
  progressText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#FFFFFF', borderRadius: 3 },

  questionList: { padding: 16, paddingBottom: 48 },

  qCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, marginBottom: 14,
    shadowColor: '#7C3AED', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  qHeader: { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'center' },
  qNumBadge: {
    backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 10,
  },
  qNumText: { color: '#7C3AED', fontSize: 12, fontWeight: '800' },
  qTypeBadge: {
    backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 10,
  },
  qTypeText: { color: '#6B7280', fontSize: 11, fontWeight: '600' },
  qText: { color: '#1F1235', fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: 14 },

  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, marginBottom: 8,
    borderWidth: 1.5, borderColor: '#EDE9FE', backgroundColor: '#FAFAFA',
  },
  optionBtnSelected: { borderColor: '#7C3AED', backgroundColor: '#EDE9FE' },
  optionCircle: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1.5,
    borderColor: '#DDD6FE', justifyContent: 'center', alignItems: 'center',
  },
  optionCircleSelected: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  optionLetter: { color: '#7C3AED', fontSize: 12, fontWeight: '700' },
  optionLetterSelected: { color: '#FFFFFF' },
  optionText: { flex: 1, color: '#374151', fontSize: 14, lineHeight: 20 },
  optionTextSelected: { color: '#4C1D95', fontWeight: '600' },

  textAnswer: {
    backgroundColor: '#F5F3FF', borderWidth: 1.5, borderColor: '#DDD6FE',
    borderRadius: 12, padding: 12, fontSize: 14, color: '#1F1235',
    minHeight: 48,
  },

  submitBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  // Result view
  resultContainer: { paddingBottom: 40 },
  resultHeader: { paddingTop: 40, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center' },
  resultEmoji: { fontSize: 52, marginBottom: 12 },
  resultTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 20 },
  scoreBig: {
    borderWidth: 2, borderRadius: 20, paddingHorizontal: 28, paddingVertical: 14,
    alignItems: 'center',
  },
  scoreNum: { fontSize: 40, fontWeight: '900' },
  scoreLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },

  reviewSection: { padding: 20 },
  reviewTitle: { fontSize: 16, fontWeight: '800', color: '#4C1D95', marginBottom: 14 },
  reviewCard: {
    borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1,
  },
  reviewCorrect: { backgroundColor: '#ECFDF5', borderColor: '#6EE7B7' },
  reviewWrong: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  reviewQNum: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', marginBottom: 4 },
  reviewQ: { fontSize: 14, fontWeight: '600', color: '#1F1235', marginBottom: 8, lineHeight: 20 },
  reviewRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  reviewYourLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  reviewAnswer: { fontSize: 12, fontWeight: '700', flex: 1 },
  correctText: { color: '#059669' },
  wrongText: { color: '#DC2626' },
  reviewExplanation: {
    fontSize: 12, color: '#6B7280', lineHeight: 18, marginTop: 6,
    fontStyle: 'italic',
  },

  doneBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  doneBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
