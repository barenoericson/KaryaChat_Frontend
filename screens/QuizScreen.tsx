import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Animated, Dimensions, StatusBar, ScrollView,
  } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#C9A0DC" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ size = 20 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke="#2ECC71" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const XIcon = ({ size = 20 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke="#E74C3C" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function QuizScreen({ route, navigation }: any) {
  const { course } = route.params;
  const questions = course.quiz;

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(40)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef(questions[0].options.map(() => new Animated.Value(0))).current;

  const question = questions[current];
  const isAnswered = selected !== null;
  const isCorrect = selected === question.answer;
  const score = answers.filter((a, i) => a === questions[i].answer).length;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideIn, { toValue: 0, friction: 7, useNativeDriver: true }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: (current + 1) / questions.length,
      duration: 600, useNativeDriver: false,
    }).start();

    // Stagger options
    optionAnims.forEach((anim: Animated.Value, i: number) => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1, duration: 300,
        delay: i * 80, useNativeDriver: true,
      }).start();
    });
  }, [current]);

  const handleSelect = (i: number) => {
    if (isAnswered) return;
    setSelected(i);
    const newAnswers = [...answers];
    newAnswers[current] = i;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      fadeIn.setValue(0);
      slideIn.setValue(40);
    } else {
      setShowResult(true);
    }
  };

  const getOptionStyle = (i: number) => {
    if (!isAnswered) return styles.option;
    if (i === question.answer) return [styles.option, styles.optionCorrect];
    if (i === selected && selected !== question.answer) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDim];
  };

  if (showResult) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{passed ? '🏆' : '📚'}</Text>
          <Text style={styles.resultTitle}>{passed ? 'Great Job!' : 'Keep Practicing!'}</Text>
          <Text style={styles.resultSub}>
            {passed ? 'You passed the quiz!' : 'Review the lessons and try again'}
          </Text>

          {/* Score circle */}
          <View style={[styles.scoreCircle, { borderColor: passed ? '#2ECC71' : '#E74C3C' }]}>
            <Text style={[styles.scoreNum, { color: passed ? '#2ECC71' : '#E74C3C' }]}>{pct}%</Text>
            <Text style={styles.scoreLabel}>{score}/{questions.length} correct</Text>
          </View>

          {/* Answer review */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Review Answers</Text>
            {questions.map((q: any, i: number) => {
              const correct = answers[i] === q.answer;
              return (
                <View key={q.id} style={[styles.reviewItem, correct ? styles.reviewCorrect : styles.reviewWrong]}>
                  <View style={styles.reviewIcon}>
                    {correct ? <CheckIcon size={16} /> : <XIcon size={16} />}
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewQ} numberOfLines={2}>{q.question}</Text>
                    <Text style={styles.reviewA}>✓ {q.options[q.answer]}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.resultBtn, { backgroundColor: course.color }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.resultBtnText}>Back to Course</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resultBtnOutline}
            onPress={() => {
              setCurrent(0);
              setSelected(null);
              setAnswers(Array(questions.length).fill(null));
              setShowResult(false);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.resultBtnOutlineText, { color: course.color }]}>Retry Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{course.title}</Text>
          <Text style={styles.headerSub}>Question {current + 1} of {questions.length}</Text>
        </View>
        <View style={[styles.scoreBadge, { borderColor: course.color }]}>
          <Text style={[styles.scoreText, { color: course.color }]}>
            {answers.filter((a, i) => a !== null && a === questions[i].answer).length} ✓
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[
          styles.progressFill,
          {
            backgroundColor: course.color,
            width: progressAnim.interpolate({
              inputRange: [0, 1], outputRange: ['0%', '100%'],
            }),
          }
        ]} />
      </View>

      <ScrollView contentContainerStyle={styles.quizContent} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <Animated.View style={[
          styles.questionCard,
          { opacity: fadeIn, transform: [{ translateY: slideIn }] }
        ]}>
          <View style={[styles.qNumBadge, { backgroundColor: course.color + '25' }]}>
            <Text style={[styles.qNum, { color: course.color }]}>Q{current + 1}</Text>
          </View>
          <Text style={styles.questionText}>{question.question}</Text>
        </Animated.View>

        {/* Options */}
        {question.options.map((opt: string, i: number) => (
          <Animated.View
            key={i}
            style={{
              opacity: optionAnims[i],
              transform: [{
                translateY: optionAnims[i].interpolate({
                  inputRange: [0, 1], outputRange: [20, 0],
                })
              }]
            }}
          >
            <TouchableOpacity
              style={getOptionStyle(i)}
              onPress={() => handleSelect(i)}
              activeOpacity={isAnswered ? 1 : 0.8}
            >
              <View style={[
                styles.optionLetter,
                isAnswered && i === question.answer && styles.optionLetterCorrect,
                isAnswered && i === selected && selected !== question.answer && styles.optionLetterWrong,
              ]}>
                <Text style={styles.optionLetterText}>
                  {['A', 'B', 'C', 'D'][i]}
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                isAnswered && i === question.answer && { color: '#2ECC71' },
                isAnswered && i === selected && selected !== question.answer && { color: '#E74C3C' },
              ]}>
                {opt}
              </Text>
              {isAnswered && i === question.answer && (
                <CheckIcon size={18} />
              )}
              {isAnswered && i === selected && selected !== question.answer && (
                <XIcon size={18} />
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Feedback */}
        {isAnswered && (
          <Animated.View style={[
            styles.feedback,
            { backgroundColor: isCorrect ? '#2ECC7115' : '#E74C3C15', borderColor: isCorrect ? '#2ECC7140' : '#E74C3C40' }
          ]}>
            <Text style={[styles.feedbackText, { color: isCorrect ? '#2ECC71' : '#E74C3C' }]}>
              {isCorrect ? '🎉 Correct! Well done!' : `❌ The correct answer is: ${question.options[question.answer]}`}
            </Text>
          </Animated.View>
        )}

        {/* Next button */}
        {isAnswered && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: course.color }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>
              {current < questions.length - 1 ? 'Next Question  →' : 'See Results  🏆'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080818' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12, gap: 12,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: 'rgba(123,47,190,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(147,112,219,0.2)',
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#7B5EA7', marginTop: 2 },
  scoreBadge: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1.5,
  },
  scoreText: { fontSize: 13, fontWeight: '900' },
  progressTrack: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 20, borderRadius: 2, overflow: 'hidden', marginBottom: 20,
  },
  progressFill: { height: '100%', borderRadius: 2 },
  quizContent: { paddingHorizontal: 20 },
  questionCard: {
    backgroundColor: '#0E0E28', borderRadius: 20,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.18)',
  },
  qNumBadge: {
    alignSelf: 'flex-start', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12,
  },
  qNum: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  questionText: { fontSize: 18, fontWeight: '800', color: '#fff', lineHeight: 26 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0E0E28', borderRadius: 14,
    padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: 'rgba(123,47,190,0.18)',
    gap: 12,
  },
  optionCorrect: {
    backgroundColor: '#2ECC7110',
    borderColor: '#2ECC7150',
  },
  optionWrong: {
    backgroundColor: '#E74C3C10',
    borderColor: '#E74C3C50',
  },
  optionDim: { opacity: 0.4 },
  optionLetter: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#13132A',
    justifyContent: 'center', alignItems: 'center',
  },
  optionLetterCorrect: { backgroundColor: '#2ECC7125' },
  optionLetterWrong: { backgroundColor: '#E74C3C25' },
  optionLetterText: { fontSize: 13, fontWeight: '900', color: '#7B5EA7' },
  optionText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#C9A0DC' },
  feedback: {
    borderRadius: 14, padding: 14,
    marginBottom: 14, borderWidth: 1,
  },
  feedbackText: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  nextBtn: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Results
  resultContainer: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  resultEmoji: { fontSize: 64, marginBottom: 16 },
  resultTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
  resultSub: { fontSize: 15, color: '#7B5EA7', textAlign: 'center', marginBottom: 28 },
  scoreCircle: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 3, justifyContent: 'center',
    alignItems: 'center', marginBottom: 32,
    backgroundColor: '#0E0E28',
  },
  scoreNum: { fontSize: 36, fontWeight: '900' },
  scoreLabel: { fontSize: 13, color: '#7B5EA7', marginTop: 4 },
  reviewSection: { width: '100%', marginBottom: 24 },
  reviewTitle: { fontSize: 16, fontWeight: '900', color: '#fff', marginBottom: 12 },
  reviewItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 12, padding: 12, marginBottom: 8,
    gap: 10, borderWidth: 1,
  },
  reviewCorrect: { backgroundColor: '#2ECC7108', borderColor: '#2ECC7130' },
  reviewWrong: { backgroundColor: '#E74C3C08', borderColor: '#E74C3C30' },
  reviewIcon: { marginTop: 2 },
  reviewInfo: { flex: 1 },
  reviewQ: { fontSize: 13, color: '#C9A0DC', fontWeight: '600', marginBottom: 4 },
  reviewA: { fontSize: 12, color: '#2ECC71', fontWeight: '600' },
  resultBtn: {
    width: '100%', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  resultBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  resultBtnOutline: {
    width: '100%', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(123,47,190,0.3)',
  },
  resultBtnOutlineText: { fontSize: 15, fontWeight: '700' },
});