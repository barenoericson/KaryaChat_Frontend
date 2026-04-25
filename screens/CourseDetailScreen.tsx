import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions, StatusBar,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#C9A0DC" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlayIcon = ({ color = '#fff', size = 18 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M5 3l14 9-14 9V3z" />
  </Svg>
);

const CheckIcon = ({ size = 16 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke="#2ECC71" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LockIcon = ({ size = 14 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M7 11V7a5 5 0 0110 0v4" stroke="#5A4A7A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 11h14v11H5z" stroke="#5A4A7A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </Svg>
);

const ClockIcon = ({ color = '#7B5EA7', size = 13 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export default function CourseDetailScreen({ route, navigation }: any) {
  const { course, progress = 0 } = route.params;
  const [activeTab, setActiveTab] = useState<'lessons' | 'about'>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const completedLessons = Math.round((progress / 100) * course.lessons.length);

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.timing(progressAnim, {
      toValue: progress / 100, duration: 1000, delay: 300, useNativeDriver: false,
    }).start();
  }, []);

  if (selectedLesson) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.lessonHeader, { borderBottomColor: course.color + '40' }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedLesson(null)}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.lessonHeaderTitle} numberOfLines={1}>{selectedLesson.title}</Text>
          <View style={styles.lessonDurationBadge}>
            <ClockIcon color={course.color} />
            <Text style={[styles.lessonDurationText, { color: course.color }]}>{selectedLesson.duration}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.lessonContent}>
          <Text style={[styles.lessonTitle, { color: course.color }]}>{selectedLesson.title}</Text>
          <Text style={styles.lessonBody}>{selectedLesson.content}</Text>
          <TouchableOpacity
            style={[styles.quizBtn, { backgroundColor: course.color }]}
            onPress={() => {
              setSelectedLesson(null);
              navigation.navigate('Quiz', { course, progress });
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.quizBtnText}>Take the Quiz  →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Hero */}
      <Animated.View style={[styles.hero, { opacity: fadeIn, borderBottomColor: course.color + '30' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Text style={styles.heroEmoji}>{course.icon}</Text>
          <Text style={styles.heroTitle}>{course.title}</Text>
          <View style={styles.heroMeta}>
            <View style={[styles.levelBadge, { borderColor: course.color }]}>
              <Text style={[styles.levelText, { color: course.color }]}>{course.level}</Text>
            </View>
            <Text style={styles.heroMetaSep}>•</Text>
            <Text style={styles.heroMetaText}>{course.lessons.length} lessons</Text>
            <Text style={styles.heroMetaSep}>•</Text>
            <Text style={styles.heroMetaText}>{course.duration}</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Your Progress</Text>
              <Text style={[styles.progressPct, { color: course.color }]}>{progress}%</Text>
            </View>
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
            <Text style={styles.progressSub}>
              {completedLessons} of {course.lessons.length} lessons completed
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Tabs */}
      <Animated.View style={[styles.tabs, { opacity: fadeIn }]}>
        {(['lessons', 'about'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && { color: course.color }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {activeTab === tab && (
              <View style={[styles.tabLine, { backgroundColor: course.color }]} />
            )}
          </TouchableOpacity>
        ))}
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'lessons' ? (
          <>
            {course.lessons.map((lesson: any, i: number) => {
              const isDone = i < completedLessons;
              const isNext = i === completedLessons;
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonCard,
                    isNext && { borderColor: course.color + '60' },
                    isDone && styles.lessonDone,
                  ]}
                  onPress={() => isNext || isDone ? setSelectedLesson(lesson) : null}
                  activeOpacity={isNext || isDone ? 0.8 : 1}
                >
                  <View style={[
                    styles.lessonNum,
                    isDone && { backgroundColor: '#2ECC7120' },
                    isNext && { backgroundColor: course.color + '25' },
                  ]}>
                    {isDone ? (
                      <CheckIcon size={16} />
                    ) : (
                      <Text style={[styles.lessonNumText, isNext && { color: course.color }]}>
                        {String(i + 1).padStart(2, '0')}
                      </Text>
                    )}
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle2, !isNext && !isDone && { color: '#3D2E5A' }]}>
                      {lesson.title}
                    </Text>
                    <View style={styles.lessonMeta}>
                      <ClockIcon color={isDone ? '#2ECC71' : isNext ? course.color : '#3D2E5A'} />
                      <Text style={[
                        styles.lessonDuration,
                        isDone && { color: '#2ECC71' },
                        isNext && { color: course.color },
                      ]}>
                        {lesson.duration}
                      </Text>
                    </View>
                  </View>
                  {isNext && <PlayIcon color={course.color} size={18} />}
                  {isDone && <Text style={styles.doneBadge}>Done</Text>}
                </TouchableOpacity>
              );
            })}

            {/* Quiz card */}
            <TouchableOpacity
              style={[styles.quizCard, { borderColor: course.color + '50' }]}
              onPress={() => navigation.navigate('Quiz', { course, progress })}
              activeOpacity={0.85}
            >
              <Text style={styles.quizCardIcon}>📝</Text>
              <View style={styles.quizCardInfo}>
                <Text style={styles.quizCardTitle}>Course Quiz</Text>
                <Text style={styles.quizCardSub}>{course.quiz.length} questions • Test your knowledge</Text>
              </View>
              <View style={[styles.quizCardBtn, { backgroundColor: course.color }]}>
                <Text style={styles.quizCardBtnText}>Start</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>About this course</Text>
            <Text style={styles.aboutDesc}>{course.description}</Text>
            <View style={styles.aboutStats}>
              {[
                { label: 'Lessons', val: course.lessons.length },
                { label: 'Quiz Questions', val: course.quiz.length },
                { label: 'Duration', val: course.duration },
                { label: 'Level', val: course.level },
              ].map(s => (
                <View key={s.label} style={styles.aboutStatItem}>
                  <Text style={[styles.aboutStatVal, { color: course.color }]}>{s.val}</Text>
                  <Text style={styles.aboutStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080818' },
  hero: {
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginLeft: 20, marginTop: 52, marginBottom: 12,
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: 'rgba(123,47,190,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(147,112,219,0.2)',
  },
  heroContent: { paddingHorizontal: 20 },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 10 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  levelBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  levelText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  heroMetaSep: { color: '#3D2E5A' },
  heroMetaText: { fontSize: 13, color: '#7B5EA7', fontWeight: '500' },
  progressSection: {},
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: '#7B5EA7', fontWeight: '600' },
  progressPct: { fontSize: 13, fontWeight: '900' },
  progressTrack: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3, overflow: 'hidden', marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressSub: { fontSize: 12, color: '#5A4A7A' },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: 'rgba(123,47,190,0.15)',
    marginHorizontal: 20,
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: '700', color: '#5A4A7A' },
  tabLine: { position: 'absolute', bottom: -1, width: '50%', height: 2, borderRadius: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  lessonCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0E0E28', borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.12)',
    gap: 12,
  },
  lessonDone: { backgroundColor: '#0A1A0E', borderColor: 'rgba(46,204,113,0.2)' },
  lessonNum: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#13132A',
    justifyContent: 'center', alignItems: 'center',
  },
  lessonNumText: { fontSize: 13, fontWeight: '800', color: '#5A4A7A' },
  lessonInfo: { flex: 1 },
  lessonTitle2: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  lessonDuration: { fontSize: 12, color: '#5A4A7A', fontWeight: '500' },
  doneBadge: {
    fontSize: 10, color: '#2ECC71', fontWeight: '800',
    backgroundColor: '#2ECC7115', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  quizCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0E0E28', borderRadius: 14,
    padding: 16, marginTop: 4,
    borderWidth: 1.5, gap: 12,
  },
  quizCardIcon: { fontSize: 28 },
  quizCardInfo: { flex: 1 },
  quizCardTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 3 },
  quizCardSub: { fontSize: 12, color: '#7B5EA7' },
  quizCardBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  quizCardBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  lessonHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14,
    borderBottomWidth: 1, gap: 10,
  },
  lessonHeaderTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#fff' },
  lessonDurationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#13132A', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  lessonDurationText: { fontSize: 11, fontWeight: '700' },
  lessonContent: { padding: 20 },
  lessonTitle: { fontSize: 22, fontWeight: '900', marginBottom: 16 },
  lessonBody: { fontSize: 15, color: '#C9A0DC', lineHeight: 26, marginBottom: 32 },
  quizBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  quizBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  aboutSection: { paddingTop: 8 },
  aboutTitle: { fontSize: 18, fontWeight: '900', color: '#fff', marginBottom: 10 },
  aboutDesc: { fontSize: 14, color: '#7B5EA7', lineHeight: 22, marginBottom: 24 },
  aboutStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  aboutStatItem: {
    width: (width - 52) / 2,
    backgroundColor: '#0E0E28', borderRadius: 14,
    padding: 14, borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.18)',
  },
  aboutStatVal: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  aboutStatLabel: { fontSize: 12, color: '#5A4A7A', fontWeight: '600' },
});