import React, { useState } from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api.client';

interface UserItem {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalLessons: number;
  totalSubmissions: number;
  totalQuizResults: number;
}

type Tab = 'users' | 'stats';

const ROLE_COLOR: Record<string, string> = {
  admin: '#7C3AED',
  teacher: '#0EA5E9',
  student: '#059669',
};

function RoleBadge({ role }: { role: string }) {
  return (
    <View style={[styles.roleBadge, { backgroundColor: ROLE_COLOR[role] ?? '#6B7280' }]}>
      <Text style={styles.roleBadgeText}>{role}</Text>
    </View>
  );
}

export default function AdminUsersScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const { data: users = [], isLoading: usersLoading, refetch } = useQuery<UserItem[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/users');
      return data;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/stats');
      return data;
    },
  });

  const { mutate: changeRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient.patch(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    onError: () => Alert.alert('Error', 'Failed to update role.'),
  });

  const confirmRoleChange = (user: UserItem) => {
    const roles = ['admin', 'teacher', 'student'].filter((r) => r !== user.role);
    Alert.alert(
      'Change Role',
      `Change role for "${user.username}" (currently: ${user.role})`,
      [
        ...roles.map((r) => ({
          text: `Make ${r}`,
          onPress: () => changeRole({ userId: user.id, role: r }),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSub}>Manage users and view platform stats</Text>
      </LinearGradient>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            Users ({users.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
            Platform Stats
          </Text>
        </Pressable>
      </View>

      {activeTab === 'users' ? (
        usersLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#7C3AED" /></View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {item.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.username}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <Text style={styles.userDate}>
                    Joined {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </Text>
                </View>
                <Pressable onPress={() => confirmRoleChange(item)}>
                  <RoleBadge role={item.role} />
                </Pressable>
              </View>
            )}
            onRefresh={refetch}
            refreshing={usersLoading}
          />
        )
      ) : (
        statsLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#7C3AED" /></View>
        ) : (
          <View style={styles.statsGrid}>
            {[
              { label: 'Total Users', value: stats?.totalUsers ?? 0, emoji: '👥' },
              { label: 'Teachers', value: stats?.totalTeachers ?? 0, emoji: '👩‍🏫' },
              { label: 'Students', value: stats?.totalStudents ?? 0, emoji: '🎒' },
              { label: 'Classes', value: stats?.totalClasses ?? 0, emoji: '📚' },
              { label: 'Lessons', value: stats?.totalLessons ?? 0, emoji: '📝' },
              { label: 'Submissions', value: stats?.totalSubmissions ?? 0, emoji: '📤' },
              { label: 'Quiz Attempts', value: stats?.totalQuizResults ?? 0, emoji: '🧩' },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statEmoji}>{stat.emoji}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },

  tabs: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#EDE9FE',
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#7C3AED' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#7C3AED', fontWeight: '700' },

  list: { padding: 16, paddingBottom: 40 },

  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#7C3AED', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center',
  },
  userAvatarText: { color: '#7C3AED', fontSize: 18, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { color: '#1F1235', fontSize: 14, fontWeight: '700' },
  userEmail: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  userDate: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },

  roleBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  roleBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12,
  },
  statCard: {
    width: '46%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20,
    alignItems: 'center',
    shadowColor: '#7C3AED', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  statEmoji: { fontSize: 32, marginBottom: 8 },
  statValue: { color: '#1F1235', fontSize: 28, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
