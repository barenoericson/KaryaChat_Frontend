import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, SOCKET_URL } from '../constants/api';

export default function ChatRoomScreen({ route, navigation }: any) {
  const { room, roomName } = route.params;
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeout = useRef<any>(null);

  useEffect(() => {
    fetchMessages();
    connectSocket();
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/rooms/${room.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (e) {
      console.error('Failed to load messages', e);
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRoom', { roomId: room.id });
    });

    socket.on('newMessage', (message: any) => {
      setMessages(prev => [...prev, message]);
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    socket.on('userTyping', (data: any) => {
      if (data.userId !== user?.id) {
        setTyping(`${data.username} is typing...`);
      }
    });

    socket.on('userStoppedTyping', () => setTyping(''));
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    socketRef.current?.emit('sendMessage', { roomId: room.id, content: text.trim() });
    setText('');
    socketRef.current?.emit('stopTyping', { roomId: room.id });
  };

  const handleTyping = (value: string) => {
    setText(value);
    socketRef.current?.emit('typing', { roomId: room.id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('stopTyping', { roomId: room.id });
    }, 1500);
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.senderId === user?.id || item.sender?.id === user?.id;
    return (
      <View style={[styles.messageRow, isMe ? styles.myRow : styles.theirRow]}>
        {!isMe && (
          <View style={styles.msgAvatar}>
            <Text style={styles.msgAvatarText}>
              {(item.sender?.username || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
          {!isMe && (
            <Text style={styles.senderName}>{item.sender?.username}</Text>
          )}
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{roomName}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Messages */}
      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={{ flex: 1 }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item: any) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Typing indicator */}
      {typing ? <Text style={styles.typingText}>{typing}</Text> : null}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={handleTyping}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#1E1E2E'
  },
  backBtn: { color: '#6C63FF', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  messagesList: { paddingHorizontal: 16, paddingVertical: 12 },
  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  myRow: { justifyContent: 'flex-end' },
  theirRow: { justifyContent: 'flex-start' },
  msgAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#6C63FF', justifyContent: 'center',
    alignItems: 'center', marginRight: 8
  },
  msgAvatarText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 12 },
  myBubble: { backgroundColor: '#6C63FF', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#1E1E2E', borderBottomLeftRadius: 4 },
  senderName: { color: '#6C63FF', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  messageText: { color: '#fff', fontSize: 15 },
  timeText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  typingText: { color: '#999', fontSize: 12, paddingHorizontal: 20, paddingBottom: 4 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#1E1E2E'
  },
  input: {
    flex: 1, backgroundColor: '#1E1E2E', color: '#fff',
    borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: '#2E2E3E'
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6C63FF', justifyContent: 'center',
    alignItems: 'center', marginLeft: 10
  },
  sendIcon: { color: '#fff', fontSize: 18 },
});