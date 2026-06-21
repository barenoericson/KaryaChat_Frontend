import React from 'react';
import {
  View, Text, ScrollView, Pressable, ActivityIndicator,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { quizzesService, QuizResult } from '../../services/quizzes.service';
import { TeacherStackParamList } from '../../navigation/types';

type RoutePropType = RouteProp<TeacherStackParamList, 'QuizResults'>;

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626';
  return (
    <View style={styles.scoreBarBg}>
      <View style={[styles.scoreBarFill, { width: `${score}%` as any, backgroundColor: color }]} />
    </View>
  );
}

function ResultRow({ result }: { result: QuizResult }) {
  const score = result.score;
  const color = score >= 75 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626';
  const bg = score >= 75 ? '#ECFDF5' : score >= 50 ? '#FFFBEB' : '#FEF2F2';
  const border = score >= 75 ? '#6EE7B7' : score >= 50 ? '#FDE68A' : '#FECACA';

  return (
    <View style={[styles.resultRow, { backgroundColor: bg, borderColor: border }]}>
      <View style={styles.resultAvatar}>
        <Text style={styles.resultAvatarText}>
          {(result.student?.username ?? '?').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{result.student?.username ?? 'Unknown'}</Text>
        <ScoreBar score={score} />
        <Text style={styles.resultMeta}>
          {result.correct}/{result.total} correct ·{' '}
          {new Date(result.completedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      </View>
      <View style={[styles.scoreBadge, { backgroundColor: color }]}>
        <Text style={styles.scoreBadgeText}>{score}%</Text>
      </View>
    </View>
  );
}

export default function QuizResultsScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RoutePropType>();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['quiz-results', params.classId, params.lessonId],
    queryFn: () => quizzesService.getResults(params.classId, params.lessonId),
  });

  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0;

  const passed = results.filter((r) => r.score >= 75).length;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Quiz Results</Text>
        <Text style={styles.headerSub} numberOfLines={1}>{params.lessonTitle}</Text>

        {results.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{results.length}</Text>
              <Text style={styles.statLabel}>Submitted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{avg}%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{passed}</Text>
              <Text style={styles.statLabel}>Passed (≥75%)</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>No results yet</Text>
          <Text style={styles.emptyDesc}>Students haven't taken this quiz yet</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {results.map((r) => <ResultRow key={r.id} result={r} />)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  header: { paddingTop: 12, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { marginBottom: 14 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16 },

  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 12, alignItems: 'center',
  },
  statCard: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.25)' },
  statValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2, textAlign: 'center' },

  list: { padding: 16, paddingBottom: 40 },

  resultRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14,
    marginBottom: 10, gap: 12, borderWidth: 1,
    shadowColor: '#7C3AED', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  resultAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  resultAvatarText: { color: '#7C3AED', fontSize: 16, fontWeight: '800' },
  resultInfo: { flex: 1 },
  resultName: { color: '#1F1235', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  scoreBarBg: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginBottom: 4 },
  scoreBarFill: { height: 6, borderRadius: 3 },
  resultMeta: { color: '#9CA3AF', fontSize: 11 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  scoreBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { color: '#4C1D95', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  emptyDesc: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
});
