import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { aiService, ChatMessage } from '../../services/ai.service';
import { Colors, Typography, Spacing, Radius, Shadows, Gradients } from '../../constants/theme';

const { width } = Dimensions.get('window');

type ChatMode = 'teacher' | 'student' | 'guest';

interface Props {
  mode: ChatMode;
  title: string;
  subtitle: string;
  onLimitReached?: () => void;
  onBack?: () => void;
}

// ─── Typing indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - i) * 200),
        ]),
      ).start();
    });
  }, []);

  return (
    <View style={styles.aiBubble}>
      <View style={styles.aiBubbleInner}>
        <View style={styles.typingRow}>
          {dots.map((dot, i) => (
            <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Message bubble ──────────────────────────────────────────────────────────

const MessageBubble = React.memo(({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={styles.userBubbleWrap}>
        <LinearGradient colors={Gradients.primary} style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{message.content}</Text>
        </LinearGradient>
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.aiBubble}>
      <View style={styles.aiBotBadge}>
        <Text style={styles.aiBotBadgeText}>AI</Text>
      </View>
      <View style={styles.aiBubbleInner}>
        <Text style={styles.aiBubbleText}>{message.content}</Text>
        <Text style={styles.timestampAi}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
});

// ─── Main ChatScreen ─────────────────────────────────────────────────────────

export default function ChatScreen({ mode, title, subtitle, onLimitReached, onBack }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guestRemaining, setGuestRemaining] = useState<number | null>(
    mode === 'guest' ? 2 : null,
  );
  const listRef = useRef<FlatList>(null);

  const getHistory = useCallback(
    (msgs: ChatMessage[]) =>
      msgs.map((m) => ({ role: m.role, content: m.content })),
    [],
  );

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    if (mode === 'guest' && guestRemaining !== null && guestRemaining <= 0) {
      onLimitReached?.();
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = getHistory(messages);
      let response;

      if (mode === 'teacher') response = await aiService.teacherChat({ message: text, history });
      else if (mode === 'student') response = await aiService.studentChat({ message: text, history });
      else response = await aiService.guestChat({ message: text, history });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (response.guestRemaining !== undefined) {
        setGuestRemaining(response.guestRemaining);
        if (response.guestRemaining <= 0) onLimitReached?.();
      }
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: e?.response?.status === 403
          ? 'You have used all your free messages. Register for unlimited access! 🚀'
          : 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, mode, guestRemaining, getHistory, onLimitReached]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => <MessageBubble message={item} />,
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={Gradients.primary} style={styles.header}>
        {onBack && (
          <Pressable style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSub}>{subtitle}</Text>
        </View>
        <View style={styles.onlineDotWrap}>
          <View style={styles.onlineDot} />
        </View>
      </LinearGradient>

      {/* Guest limit banner */}
      {mode === 'guest' && guestRemaining !== null && (
        <View style={[
          styles.guestBanner,
          guestRemaining <= 1 && styles.guestBannerWarn,
        ]}>
          <Text style={[
            styles.guestBannerText,
            guestRemaining <= 1 && styles.guestBannerTextWarn,
          ]}>
            {guestRemaining > 0
              ? `${2 - guestRemaining} of 2 free messages used`
              : 'Free limit reached — register for unlimited access'}
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.messageList}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>
              {mode === 'teacher' ? 'Brainstorm with AI' : mode === 'student' ? 'Ask your AI tutor' : 'Try CodeMate AI'}
            </Text>
            <Text style={styles.emptySub}>
              {mode === 'teacher'
                ? 'Get help designing lessons, exercises, and project ideas.'
                : mode === 'student'
                ? 'Ask any programming question — I\'ll guide you step by step.'
                : 'Ask me anything about programming! (2 free messages)'}
            </Text>
          </View>
        }
      />

      {/* Typing indicator */}
      {isLoading && (
        <View style={styles.typingWrap}>
          <TypingIndicator />
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder={mode === 'teacher' ? 'Ask for lesson ideas...' : 'Ask a question...'}
          placeholderTextColor={Colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <Pressable
          onPress={sendMessage}
          disabled={!input.trim() || isLoading}
          style={({ pressed }) => [
            styles.sendBtn,
            (!input.trim() || isLoading) && styles.sendBtnDisabled,
            pressed && styles.sendBtnPressed,
          ]}
        >
          {isLoading
            ? <ActivityIndicator size="small" color={Colors.textInverse} />
            : <Text style={styles.sendIcon}>➤</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: Spacing.screenH,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  backArrow: { color: Colors.textInverse, fontSize: 18 },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textInverse,
  },
  headerSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.primarySoft,
    marginTop: 1,
  },
  onlineDotWrap: { padding: 4 },
  onlineDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#4ADE80',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },

  guestBanner: {
    backgroundColor: Colors.primarySoft,
    paddingVertical: 8,
    paddingHorizontal: Spacing.screenH,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryBorder,
  },
  guestBannerWarn: { backgroundColor: Colors.errorSoft, borderBottomColor: Colors.error },
  guestBannerText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.primary,
    textAlign: 'center',
  },
  guestBannerTextWarn: { color: Colors.error },

  messageList: {
    padding: Spacing.screenH,
    paddingBottom: 8,
    flexGrow: 1,
  },

  // User bubble
  userBubbleWrap: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: {
    maxWidth: width * 0.75,
    borderRadius: Radius.xl,
    borderBottomRightRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userBubbleText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textInverse,
    lineHeight: 22,
  },

  // AI bubble
  aiBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    maxWidth: width * 0.82,
  },
  aiBotBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8, marginTop: 2,
  },
  aiBotBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 9,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  aiBubbleInner: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderBottomLeftRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    ...Shadows.sm,
  },
  aiBubbleText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    lineHeight: 22,
  },

  timestamp: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 4,
    marginRight: 4,
  },
  timestampAi: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // Typing indicator
  typingWrap: { paddingHorizontal: Spacing.screenH, paddingBottom: 4 },
  typingRow: { flexDirection: 'row', gap: 4, paddingVertical: 4 },
  typingDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  // Empty state
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 60, paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.screenH,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
    ...Shadows.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.md,
  },
  sendBtnDisabled: { backgroundColor: Colors.textMuted },
  sendBtnPressed: { opacity: 0.8 },
  sendIcon: { color: Colors.textInverse, fontSize: 16 },
});
