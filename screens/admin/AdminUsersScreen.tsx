import React, { useState } from 'react';
import {
  View, Text, FlatList, TextInput, Pressable,
  ActivityIndicator, StyleSheet, StatusBar, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api.client';
import { Typography } from '../../constants/theme';

interface UserItem {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  createdAt: string;
}

type Filter = 'all' | 'teacher' | 'student';

const ROLE_COLOR: Record<string, string> = {
  admin:   '#7C3AED',
  teacher: '#0EA5E9',
  student: '#059669',
};

const AVATAR_BG: Record<string, string> = {
  admin:   '#F3EEFF',
  teacher: '#E0F2FE',
  student: '#D1FAE5',
};

function UserRow({ item, onPress }: { item: UserItem; onPress: () => void }) {
  const initial = item.username.charAt(0).toUpperCase();
  const roleColor = ROLE_COLOR[item.role] ?? '#6B7280';
  const avatarBg  = AVATAR_BG[item.role]  ?? '#F3F4F6';

  return (
    <View style={styles.userRow}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={[styles.avatarText, { color: roleColor }]}>{initial}</Text>
      </View>

      {/* Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userRole} numberOfLines={1}>
          {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
        </Text>
      </View>

      {/* Three-dot */}
      <Pressable
        style={({ pressed }) => [styles.menuBtn, pressed && { opacity: 0.6 }]}
        onPress={onPress}
        hitSlop={8}
      >
        <MaterialIcons name="more-vert" size={20} color="#A99BCF" />
      </Pressable>
    </View>
  );
}

export default function AdminUsersScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter]   = useState<Filter>('all');
  const [search, setSearch]   = useState('');

  const { data: users = [], isLoading, refetch } = useQuery<UserItem[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/users');
      return data;
    },
  });

  const { mutate: changeRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient.patch(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    onError:   () => Alert.alert('Error', 'Failed to update role.'),
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

  const filtered = users.filter((u) => {
    const matchFilter = filter === 'all' || u.role === filter;
    const matchSearch = search.trim() === '' ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
        <Text style={styles.headerSub}>{users.length} accounts</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={18} color="#A99BCF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users"
          placeholderTextColor="#A99BCF"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <MaterialIcons name="close" size={16} color="#A99BCF" />
          </Pressable>
        )}
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {(['all', 'teacher', 'student'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* User list */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <UserRow item={item} onPress={() => confirmRoleChange(item)} />
          )}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="people-outline" size={40} color="#D9CEF7" />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* Header */
  header: {
    paddingTop: 52,
    paddingHorizontal: 22,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 26,
    color: '#1A1033',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    color: '#6E6788',
    marginTop: 2,
  },

  /* Search */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    marginBottom: 12,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F7F5FF',
    borderWidth: 1.5,
    borderColor: '#ECE7FB',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: '#1A1033',
    height: '100%',
  },

  /* Filter pills */
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
    marginBottom: 6,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F7F5FF',
    borderWidth: 1,
    borderColor: '#ECE7FB',
  },
  pillActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  pillText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#6E6788',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },

  /* List */
  list: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 40 },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EEFF',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 16,
  },
  userInfo: { flex: 1 },
  userName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 14,
    color: '#1A1033',
  },
  userRole: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: '#6E6788',
    marginTop: 2,
  },
  menuBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Empty */
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: '#A99BCF',
  },
});
