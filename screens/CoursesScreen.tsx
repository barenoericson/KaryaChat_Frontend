import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COURSES_DATA } from '../constants/coursesData';

const { width } = Dimensions.get('window');

const FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const BookIcon = ({ color = '#fff', size = 18 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = ({ color = '#7B5EA7', size = 13 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ArrowIcon = ({ color = '#C9A0DC', size = 16 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckIcon = ({ size = 14 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke="#2ECC71" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function CoursesScreen({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState('All');
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const progressAnims = useRef(COURSES_DATA.map(() => new Animated.Value(0))).current;

  const filtered = activeFilter === 'All'
    ? COURSES_DATA
    : COURSES_DATA.filter(c => c.level === activeFilter);

  const getProgress = (id: string) => {
    const map: any = { '1': 75, '2': 40, '3': 10, '4': 0, '5': 0 };
    return map[id] || 0;
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();

    COURSES_DATA.forEach((course, i) => {
      Animated.timing(progressAnims[i], {
        toValue: getProgress(course.id) / 100,
        duration: 1000, delay: 300 + i * 100,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080818" />
      <View style={styles.ring1} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeIn }]}>
        <View>
          <Text style={styles.headerSub}>Keep learning 💜</Text>
          <Text style={styles.headerTitle}>Courses</Text>
        </View>
        <View style={styles.headerBadge}>
          <BookIcon size={14} color="#C9A0DC" />
          <Text style={styles.headerBadgeText}>{COURSES_DATA.length} Courses</Text>
        </View>
      </Animated.View>

      {/* Filter tabs */}
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterRow, { opacity: fadeIn }]}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      {/* Course list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filtered.map((course, i) => {
          const progress = getProgress(course.id);
          const isCompleted = progress === 100;
          const isStarted = progress > 0;

          return (
            <Animated.View
              key={course.id}
              style={[styles.card, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('CourseDetail', { course, progress })}
              >
                {/* Card header */}
                <View style={styles.cardTop}>
                  <View style={[styles.iconWrap, { backgroundColor: `${course.color}20` }]}>
                    <Text style={styles.icon}>{course.icon}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{course.title}</Text>
                    <View style={styles.metaRow}>
                      <ClockIcon />
                      <Text style={styles.metaText}>{course.duration}</Text>
                      <View style={[styles.levelDot, { backgroundColor: course.color }]} />
                      <Text style={[styles.levelText, { color: course.color }]}>{course.level}</Text>
                    </View>
                  </View>
                  {isCompleted
                    ? <CheckIcon size={20} />
                    : <ArrowIcon />
                  }
                </View>

                {/* Description */}
                <Text style={styles.desc} numberOfLines={2}>{course.description}</Text>

                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statVal}>{course.lessons.length}</Text>
                    <Text style={styles.statLabel}>Lessons</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statVal}>{course.quiz.length}</Text>
                    <Text style={styles.statLabel}>Quiz</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statVal, { color: course.color }]}>{progress}%</Text>
                    <Text style={styles.statLabel}>Done</Text>
                  </View>
                </View>

                {/* Progress bar */}
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

                {/* CTA button */}
                <TouchableOpacity
                  style={[styles.startBtn, { borderColor: course.color }]}
                  onPress={() => navigation.navigate('CourseDetail', { course, progress })}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.startBtnText, { color: course.color }]}>
                    {isCompleted ? '🔁 Review Course' : isStarted ? '▶ Continue' : '🚀 Start Course'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080818' },
  ring1: {
    position: 'absolute', width: width * 1.3, height: width * 1.3,
    borderRadius: width * 0.65, borderWidth: 1,
    borderColor: 'rgba(123,47,190,0.06)', top: -width * 0.5,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 56, marginBottom: 16,
  },
  headerSub: { fontSize: 13, color: '#9B7EC8', fontWeight: '600' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 2 },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(123,47,190,0.15)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(147,112,219,0.25)',
  },
  headerBadgeText: { color: '#C9A0DC', fontSize: 12, fontWeight: '700' },
  filterRow: { marginBottom: 16, maxHeight: 44 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#0E0E28',
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.2)',
  },
  filterBtnActive: {
    backgroundColor: '#7B2FBE',
    borderColor: '#7B2FBE',
  },
  filterText: { color: '#5A4A7A', fontSize: 13, fontWeight: '700' },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20 },
  card: {
    backgroundColor: '#0E0E28', borderRadius: 20,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.18)',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconWrap: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  icon: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: '#7B5EA7', fontWeight: '500' },
  levelDot: { width: 4, height: 4, borderRadius: 2 },
  levelText: { fontSize: 11, fontWeight: '700' },
  desc: { fontSize: 13, color: '#5A4A7A', lineHeight: 18, marginBottom: 14 },
  statsRow: { flexDirection: 'row', marginBottom: 12, gap: 16 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 10, color: '#5A4A7A', fontWeight: '600', textTransform: 'uppercase' },
  progressTrack: {
    height: 5, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3, overflow: 'hidden', marginBottom: 12,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  startBtn: {
    borderRadius: 12, paddingVertical: 11,
    alignItems: 'center', borderWidth: 1.5,
  },
  startBtnText: { fontSize: 14, fontWeight: '800' },
});