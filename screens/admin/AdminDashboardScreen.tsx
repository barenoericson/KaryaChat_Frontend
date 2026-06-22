import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api.client';
import { Typography } from '../../constants/theme';

interface Stats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
}

// Simulated 7-day active user data (heights as % of max)
const BAR_DATA = [0.45, 0.60, 0.50, 0.75, 0.65, 0.88, 1.0];
const BAR_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BAR_MAX_H = 80;

function StatCard({
  icon, label, value, accent, delay,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  accent: string;
  delay: number;
}) {
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeIn,  { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
      <View style={[styles.statIconWrap, { backgroundColor: accent + '22' }]}>
        <MaterialIcons name={icon} size={20} color={accent} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function AdminDashboardScreen() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/stats');
      return data;
    },
  });

  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const totalUsers    = stats?.totalUsers    ?? 0;
  const totalTeachers = stats?.totalTeachers ?? 0;
  const totalClasses  = stats?.totalClasses  ?? 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

      {/* Purple header */}
      <LinearGradient colors={['#8B49F0', '#5B21B6']} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.shieldWrap}>
            <MaterialIcons name="shield" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Admin Console</Text>
            <Text style={styles.headerSub}>Platform overview</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat cards 2×2 */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="people"
            label="Total users"
            value={String(totalUsers)}
            accent="#7C3AED"
            delay={0}
          />
          <StatCard
            icon="cast-for-education"
            label="Teachers"
            value={String(totalTeachers)}
            accent="#0EA5E9"
            delay={80}
          />
          <StatCard
            icon="school"
            label="Classes"
            value={String(totalClasses)}
            accent="#059669"
            delay={160}
          />
          <StatCard
            icon="trending-up"
            label="This week"
            value="+12%"
            accent="#F59E0B"
            delay={240}
          />
        </View>

        {/* Active users bar chart */}
        <Animated.View style={[styles.chartCard, { opacity: fadeIn }]}>
          <Text style={styles.chartTitle}>Active users · 7 days</Text>

          <View style={styles.chart}>
            {BAR_DATA.map((ratio, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <LinearGradient
                    colors={['#9B6DFF', '#7C3AED']}
                    style={[styles.bar, { height: BAR_MAX_H * ratio }]}
                  />
                </View>
                <Text style={styles.barDay}>{BAR_DAYS[i]}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5FF' },

  /* Header */
  header: {
    paddingTop: 52,
    paddingBottom: 22,
    paddingHorizontal: 22,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shieldWrap: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 1,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40 },

  /* Stat cards */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 26,
    color: '#1A1033',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: '#6E6788',
  },

  /* Chart */
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  chartTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 13.5,
    color: '#1A1033',
    marginBottom: 18,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_H + 28,
  },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: {
    width: 26,
    height: BAR_MAX_H,
    borderRadius: 8,
    backgroundColor: '#F3EEFF',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
  },
  barDay: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 10,
    color: '#A99BCF',
    marginTop: 6,
  },
});
