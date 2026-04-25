import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions,
  StatusBar, Image,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const BotIcon = ({ color = '#fff', size = 22 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={8} width={18} height={13} rx={3} stroke={color} strokeWidth={2} />
    <Path d="M9 12h.01M15 12h.01" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Path d="M9 16s1 1 3 1 3-1 3-1" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M12 8V5M9 5h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const StarIcon = ({ color = '#FFD700', size = 16 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const FlameIcon = ({ size = 18 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="#FF6B35">
    <Path d="M12 2c0 0-5 5-5 10a5 5 0 0010 0c0-5-5-10-5-10z" />
    <Path d="M12 8c0 0-2.5 2.5-2.5 5a2.5 2.5 0 005 0c0-2.5-2.5-5-2.5-5z" fill="#FFD700" />
  </Svg>
);

const ArrowIcon = ({ color = '#C9A0DC', size = 16 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrophyIcon = ({ size = 20 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 21h8M12 17v4M7 4H4a2 2 0 00-2 2v1a4 4 0 004 4h.5M17 4h3a2 2 0 012 2v1a4 4 0 01-4 4h-.5" stroke="#FFD700" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 4h10v8a5 5 0 01-10 0V4z" stroke="#FFD700" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const courses = [
  { id: '1', title: 'HTML & CSS Fundamentals', lessons: 12, progress: 0, color: '#E44D26', colorLight: 'rgba(228,77,38,0.15)', icon: '🌐', level: 'Beginner' },
  { id: '2', title: 'JavaScript Basics', lessons: 18, progress: 0, color: '#F7DF1E', colorLight: 'rgba(247,223,30,0.12)', icon: '⚡', level: 'Beginner' },
  { id: '3', title: 'React Native', lessons: 24, progress: 0, color: '#61DAFB', colorLight: 'rgba(97,218,251,0.12)', icon: '⚛️', level: 'Intermediate' },
  { id: '4', title: 'Node.js & NestJS', lessons: 20, progress: 0, color: '#68A063', colorLight: 'rgba(104,160,99,0.12)', icon: '🟢', level: 'Intermediate' },
  { id: '5', title: 'PostgreSQL & Databases', lessons: 16, progress: 0, color: '#336791', colorLight: 'rgba(51,103,145,0.15)', icon: '🗄️', level: 'Intermediate' },
];

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const mascotFloat = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;
  const progressAnims = useRef(courses.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();

    courses.forEach((course, i) => {
      Animated.timing(progressAnims[i], {
        toValue: course.progress / 100,
        duration: 1000, delay: 300 + i * 100,
        useNativeDriver: false,
      }).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotFloat, { toValue: -8, duration: 2000, useNativeDriver: true }),
        Animated.timing(mascotFloat, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.15, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const totalProgress = Math.round(
    courses.reduce((acc, c) => acc + c.progress, 0) / courses.length
  );

  const completedLessons = courses.reduce(
    (acc, c) => acc + Math.round((c.progress / 100) * c.lessons), 0
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080818" />
      <View style={styles.ring1} />
      <Animated.View style={[styles.glowBlob, { transform: [{ scale: glowPulse }] }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeIn }]}>
          <View>
            <Text style={styles.greeting}>Good day! 👋</Text>
            <Text style={styles.username}>{user?.username || 'Learner'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#C9A0DC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Card */}
        <Animated.View style={[styles.heroCard, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <Animated.View style={[styles.glowBlobCard, { transform: [{ scale: glowPulse }] }]} />
          <View style={styles.heroLeft}>
            <View style={styles.heroBadge}>
              <BotIcon size={12} color="#C9A0DC" />
              <Text style={styles.heroBadgeText}>AI Tutor</Text>
            </View>
            <Text style={styles.heroTitle}>Chat with{'\n'}Karya AI</Text>
            <Text style={styles.heroSub}>Ask anything about programming</Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => navigation.navigate('KaryaAI')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>Start Chatting</Text>
              <ArrowIcon color="#fff" size={14} />
            </TouchableOpacity>
          </View>
          <Animated.Image
            source={require('../assets/finalkaryachatlog.png')}
            style={[styles.heroMascot, { transform: [{ translateY: mascotFloat }] }]}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Stats Row */}
        <Animated.View style={[styles.statsRow, { opacity: fadeIn }]}>
          {[
            { icon: <FlameIcon size={20} />, val: '0', label: 'Day Streak' },
            { icon: <TrophyIcon size={20} />, val: `${totalProgress}%`, label: 'Overall' },
            { icon: <StarIcon size={20} />, val: `${completedLessons}`, label: 'Lessons' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              {s.icon}
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Overall Progress */}
        <Animated.View style={[styles.overallCard, { opacity: fadeIn }]}>
          <View style={styles.overallHeader}>
            <Text style={styles.overallTitle}>Overall Progress</Text>
            <Text style={styles.overallPct}>{totalProgress}%</Text>
          </View>
          <View style={styles.overallTrack}>
            <View style={[styles.overallFill, { width: `${totalProgress}%` }]} />
          </View>
          <Text style={styles.overallSub}>{completedLessons} lessons completed across all courses</Text>
        </Animated.View>

        {/* Courses Section */}
        <Animated.View style={{ opacity: fadeIn }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Courses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {courses.map((course, i) => (
            <Animated.View
              key={course.id}
              style={[
                styles.courseCard,
                { borderLeftColor: course.color, backgroundColor: course.colorLight },
                { opacity: fadeIn }
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('CourseDetail', { course, progress: course.progress })}
              >
                <View style={styles.courseTop}>
                  <View style={styles.courseIconWrap}>
                    <Text style={styles.courseEmoji}>{course.icon}</Text>
                  </View>
                  <View style={styles.courseInfo}>
                    <View style={styles.courseTitleRow}>
                      <Text style={styles.courseTitle}>{course.title}</Text>
                      <View style={[styles.levelBadge, { borderColor: course.color }]}>
                        <Text style={[styles.levelText, { color: course.color }]}>{course.level}</Text>
                      </View>
                    </View>
                    <Text style={styles.courseLessons}>{course.lessons} lessons</Text>
                  </View>
                  <ArrowIcon size={16} />
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: course.color,
                          width: progressAnims[i].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressPct, { color: course.color }]}>
                    {course.progress}%
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080818' },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  ring1: {
    position: 'absolute', width: width * 1.3, height: width * 1.3,
    borderRadius: width * 0.65, borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.06)', top: -width * 0.5,
  },
  glowBlob: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(75,0,130,0.15)', top: -60, right: -80,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 56, marginBottom: 20,
  },
  greeting: { fontSize: 13, color: '#9B7EC8', fontWeight: '600', letterSpacing: 0.5 },
  username: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2 },
  logoutBtn: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: 'rgba(123,47,190,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(147,112,219,0.2)',
  },
  heroCard: {
    backgroundColor: '#1A0A35', borderRadius: 24, padding: 20,
    marginBottom: 16, overflow: 'hidden', flexDirection: 'row',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(123,47,190,0.3)',
    shadowColor: '#7B2FBE', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  glowBlobCard: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(123,47,190,0.2)', right: -40, top: -40,
  },
  heroLeft: { flex: 1, zIndex: 1 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(123,47,190,0.25)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
    gap: 5, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(147,112,219,0.3)',
  },
  heroBadgeText: { color: '#C9A0DC', fontSize: 11, fontWeight: '700' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff', lineHeight: 28, marginBottom: 6 },
  heroSub: { fontSize: 12, color: 'rgba(201,160,220,0.7)', marginBottom: 14 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#7B2FBE', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 9, alignSelf: 'flex-start',
  },
  heroBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  heroMascot: { width: 110, height: 110, marginRight: -8 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#0E0E28', borderRadius: 16,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.18)',
  },
  statVal: { fontSize: 20, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 10, color: '#7B5EA7', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  overallCard: {
    backgroundColor: '#0E0E28', borderRadius: 20, padding: 18,
    marginBottom: 24, borderWidth: 1, borderColor: 'rgba(123,47,190,0.18)',
  },
  overallHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  overallTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  overallPct: { fontSize: 15, fontWeight: '900', color: '#9B59B6' },
  overallTrack: {
    height: 8, backgroundColor: 'rgba(123,47,190,0.15)',
    borderRadius: 4, overflow: 'hidden', marginBottom: 8,
  },
  overallFill: { height: '100%', borderRadius: 4, backgroundColor: '#7B2FBE' },
  overallSub: { fontSize: 12, color: '#5A4A7A', fontWeight: '500' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  seeAll: { fontSize: 13, color: '#9B59B6', fontWeight: '700' },
  courseCard: { borderRadius: 18, padding: 16, marginBottom: 12, borderLeftWidth: 3 },
  courseTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  courseIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  courseEmoji: { fontSize: 22 },
  courseInfo: { flex: 1 },
  courseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  courseTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: '#fff' },
  levelBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  levelText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  courseLessons: { fontSize: 12, color: '#7B5EA7' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: {
    flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressPct: { fontSize: 12, fontWeight: '800', minWidth: 35, textAlign: 'right' },
});