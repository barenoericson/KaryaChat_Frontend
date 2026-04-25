import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Modal
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/api';

export default function ChatListScreen({ navigation }: any) {
  const { token, user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchModal, setSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 1) { setSearchResults([]); return; }
    try {
      setSearching(true);
      const res = await axios.get(`${API_BASE_URL}/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(res.data);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setSearching(false);
    }
  };

  const startChat = async (otherUser: any) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/chat/rooms/direct`,
        { userId: otherUser.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchModal(false);
      setSearchQuery('');
      setSearchResults([]);
      await fetchRooms();
      navigation.navigate('ChatRoom', {
        room: res.data,
        roomName: otherUser.username,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const getRoomName = (room: any) => {
    if (room.isGroup) return room.name;
    const other = room.members?.find((m: any) => m.id !== user?.id);
    return other?.username || 'Unknown';
  };

  const renderRoom = ({ item }: any) => (
    <TouchableOpacity
      style={styles.roomItem}
      onPress={() => navigation.navigate('ChatRoom', {
        room: item,
        roomName: getRoomName(item)
      })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {getRoomName(item).charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{getRoomName(item)}</Text>
        <Text style={styles.roomSub}>
          {item.isGroup ? '👥 Group Chat' : '💬 Direct Message'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Chats</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.newChatBtn}
            onPress={() => setSearchModal(true)}
          >
            <Text style={styles.newChatIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logoutBtn}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 40 }} />
      ) : rooms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No chats yet!</Text>
          <Text style={styles.emptySubText}>Tap ✏️ to start a conversation</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item: any) => item.id}
          renderItem={renderRoom}
          contentContainerStyle={{ paddingTop: 8 }}
          onRefresh={fetchRooms}
          refreshing={loading}
        />
      )}

      {/* Search Users Modal */}
      <Modal visible={searchModal} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Message</Text>
            <TouchableOpacity onPress={() => {
              setSearchModal(false);
              setSearchQuery('');
              setSearchResults([]);
            }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={searchUsers}
              autoFocus
              autoCapitalize="none"
            />
          </View>

          {searching ? (
            <ActivityIndicator color="#6C63FF" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => startChat(item)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{item.username}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length > 0 ? (
                  <Text style={styles.noResults}>No users found</Text>
                ) : (
                  <Text style={styles.noResults}>Type a username to search</Text>
                )
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#1E1E2E'
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  newChatBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1E1E2E', justifyContent: 'center', alignItems: 'center'
  },
  newChatIcon: { fontSize: 18 },
  logoutBtn: { color: '#6C63FF', fontSize: 14, fontWeight: 'bold' },
  roomItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1E1E2E'
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#6C63FF', justifyContent: 'center',
    alignItems: 'center', marginRight: 14
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  roomInfo: { flex: 1 },
  roomName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  roomSub: { color: '#999', fontSize: 13, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  emptySubText: { color: '#999', fontSize: 14, marginTop: 8 },
  modal: { flex: 1, backgroundColor: '#0F0F1A', paddingTop: 56 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 16
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  closeBtn: { color: '#999', fontSize: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1E2E', borderRadius: 12,
    marginHorizontal: 20, paddingHorizontal: 14,
    marginBottom: 16, borderWidth: 1, borderColor: '#2E2E3E'
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 12 },
  userItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1E1E2E'
  },
  userName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  userEmail: { color: '#999', fontSize: 13, marginTop: 2 },
  noResults: { color: '#999', textAlign: 'center', marginTop: 40, fontSize: 15 },
});