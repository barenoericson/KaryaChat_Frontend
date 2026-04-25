import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView,
  Platform, Animated, Dimensions, StatusBar, Image,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/api';

const { width } = Dimensions.get('window');

const SendIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#7B5EA7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SUGGESTED_PROMPTS = [
  "What is a REST API?",
  "Explain React hooks",
  "How does async/await work?",
  "What is PostgreSQL?",
  "Explain NestJS modules",
];

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export default function KaryaChatScreen() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const mascotFloat = useRef(new Animated.Value(0)).current;
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadHistory();
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotFloat, { toValue: -8, duration: 2000, useNativeDriver: true }),
        Animated.timing(mascotFloat, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveHistory();
  }, [messages]);

  const loadHistory = async () => {
    try {
      const key = `karya_chat_${user?.id}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        const restored = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(restored);
        setShowSuggestions(restored.length === 0);
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
  };

  const saveHistory = async () => {
    try {
      const key = `karya_chat_${user?.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  };

  const clearHistory = async () => {
    try {
      const key = `karya_chat_${user?.id}`;
      await AsyncStorage.removeItem(key);
      setMessages([]);
      setShowSuggestions(true);
    } catch (e) {
      console.error('Failed to clear chat history', e);
    }
  };

  useEffect(() => {
    if (loading) {
      const animateDot = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          ])
        );
      animateDot(typingDot1, 0).start();
      animateDot(typingDot2, 150).start();
      animateDot(typingDot3, 300).start();
    }
  }, [loading]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput('');
    setShowSuggestions(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await axios.post(
        `${API_BASE_URL}/ai/chat`,
        { message: messageText, history },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: res.data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      const errMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Oops! Something went wrong. Please try again 💜",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderMessage = (msg: Message) => {
    const isUser = msg.role === 'user';
    return (
      <View key={msg.id} style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && (
          <Image
            source={require('../assets/finalkaryachatlog.png')}
            style={styles.aiAvatar}
            resizeMode="contain"
          />
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {!isUser && <Text style={styles.aiName}>Karya</Text>}
          <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
            {msg.content}
          </Text>
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {formatTime(msg.timestamp)}
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
      <StatusBar barStyle="light-content" backgroundColor="#080818" />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeIn }]}>
        <View style={styles.headerLeft}>
          <Animated.Image
            source={require('../assets/finalkaryachatlog.png')}
            style={[styles.headerMascot, { transform: [{ translateY: mascotFloat }] }]}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerName}>Karya AI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Always online</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
            <TrashIcon />
          </TouchableOpacity>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Gemini</Text>
          </View>
        </View>
      </Animated.View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && (
          <Animated.View style={[styles.welcome, { opacity: fadeIn }]}>
            <Image
              source={require('../assets/finalkaryachatlog.png')}
              style={styles.welcomeMascot}
              resizeMode="contain"
            />
            <Text style={styles.welcomeTitle}>Hi {user?.username}! 👋</Text>
            <Text style={styles.welcomeSub}>
              I'm Karya, your personal AI programming tutor.{'\n'}Ask me anything about coding!
            </Text>
            {showSuggestions && (
              <View style={styles.suggestions}>
                <Text style={styles.suggestionsTitle}>Try asking:</Text>
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionBtn}
                    onPress={() => sendMessage(prompt)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.suggestionText}>{prompt}</Text>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path d="M5 12h14M12 5l7 7-7 7" stroke="#9B59B6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {messages.map(renderMessage)}

        {loading && (
          <View style={[styles.messageRow, styles.aiRow]}>
            <Image
              source={require('../assets/finalkaryachatlog.png')}
              style={styles.aiAvatar}
              resizeMode="contain"
            />
            <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
              {[typingDot1, typingDot2, typingDot3].map((dot, i) => (
                <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: dot }] }]} />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Input */}
      <View style={styles.inputArea}>
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Ask Karya anything..."
            placeholderTextColor="#3D2E5A"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <SendIcon />}
          </TouchableOpacity>
        </View>
        <Text style={styles.inputHint}>Powered by Google Gemini 💜</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080818' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(123,47,190,0.2)',
    backgroundColor: '#080818',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerMascot: { width: 44, height: 44 },
  headerName: { fontSize: 17, fontWeight: '900', color: '#fff' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2ECC71' },
  onlineText: { fontSize: 11, color: '#2ECC71', fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clearBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(123,47,190,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(147,112,219,0.2)',
  },
  headerBadge: {
    backgroundColor: 'rgba(123,47,190,0.2)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(147,112,219,0.3)',
  },
  headerBadgeText: { color: '#C9A0DC', fontSize: 11, fontWeight: '700' },
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingTop: 16 },
  welcome: { alignItems: 'center', paddingTop: 20, paddingBottom: 10 },
  welcomeMascot: { width: 120, height: 120, marginBottom: 12 },
  welcomeTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 8 },
  welcomeSub: { fontSize: 14, color: '#7B5EA7', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  suggestions: { width: '100%' },
  suggestionsTitle: { fontSize: 12, color: '#5A4A7A', fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  suggestionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0E0E28', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.2)',
  },
  suggestionText: { flex: 1, color: '#C9A0DC', fontSize: 14, fontWeight: '600' },
  messageRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start', gap: 8 },
  aiAvatar: { width: 34, height: 34, marginBottom: 4 },
  bubble: { maxWidth: width * 0.75, borderRadius: 18, padding: 12 },
  userBubble: {
    backgroundColor: '#7B2FBE', borderBottomRightRadius: 4,
    shadowColor: '#7B2FBE', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  aiBubble: {
    backgroundColor: '#0E0E28', borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.2)',
  },
  aiName: { fontSize: 11, color: '#9B59B6', fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
  bubbleText: { color: '#C9A0DC', fontSize: 14, lineHeight: 21 },
  userBubbleText: { color: '#fff' },
  timestamp: { fontSize: 10, color: '#5A4A7A', marginTop: 6, textAlign: 'right' },
  userTimestamp: { color: 'rgba(255,255,255,0.5)' },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 16, paddingHorizontal: 16 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7B2FBE' },
  inputArea: {
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: 'rgba(123,47,190,0.2)',
    backgroundColor: '#080818',
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1, backgroundColor: '#0E0E28', color: '#fff',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, maxHeight: 100, borderWidth: 1.5,
    borderColor: 'rgba(123,47,190,0.25)',
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#7B2FBE', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7B2FBE', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  sendBtnDisabled: { backgroundColor: 'rgba(123,47,190,0.3)' },
  inputHint: { fontSize: 10, color: '#2D1F4A', textAlign: 'center', marginTop: 8, fontWeight: '600' },
});