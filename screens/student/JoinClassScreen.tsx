import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { classesService } from '../../services/classes.service';

const CODE_LENGTH = 7;

export default function JoinClassScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);

  const { mutate: joinClass, isPending } = useMutation({
    mutationFn: () => classesService.joinClass(code.trim().toUpperCase()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolled-classes'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      const msg =
        error?.response?.status === 404
          ? 'Class not found. Double-check the code and try again.'
          : error?.response?.status === 409
          ? 'You are already enrolled in this class.'
          : 'Failed to join. Please try again.';
      Alert.alert('Error', msg);
    },
  });

  const handleJoin = () => {
    if (code.trim().length !== CODE_LENGTH) {
      return Alert.alert('Incomplete', 'Please enter all 7 characters of the class code.');
    }
    joinClass();
  };

  const handleChange = (text: string) => {
    setCode(text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH));
  };

  const filled = code.length;
  const canJoin = filled === CODE_LENGTH && !isPending;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🔑</Text>
          </View>
          <Text style={styles.headerTitle}>Join a Class</Text>
          <Text style={styles.headerSub}>Enter the class code from your teacher</Text>
        </LinearGradient>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Class Code</Text>
          <Text style={styles.cardHint}>7 characters — letters and numbers</Text>

          {/* Character boxes — tap to focus hidden input */}
          <Pressable style={styles.boxRow} onPress={() => inputRef.current?.focus()}>
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const char = code[i] ?? '';
              const isActive = i === filled && filled < CODE_LENGTH;
              return (
                <View
                  key={i}
                  style={[
                    styles.box,
                    char ? styles.boxFilled : styles.boxEmpty,
                    isActive && styles.boxActive,
                  ]}
                >
                  <Text style={[styles.boxChar, !char && styles.boxPlaceholder]}>
                    {char || '·'}
                  </Text>
                </View>
              );
            })}
          </Pressable>

          {/* Hidden real input */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={handleChange}
            maxLength={CODE_LENGTH}
            autoCapitalize="characters"
            autoCorrect={false}
            keyboardType="default"
            autoFocus
          />

          <Text style={styles.charCount}>
            {filled} / {CODE_LENGTH}
          </Text>

          {/* Join button */}
          <Pressable
            onPress={handleJoin}
            disabled={!canJoin}
            style={({ pressed }) => [{ opacity: !canJoin ? 0.45 : pressed ? 0.8 : 1 }]}
          >
            <LinearGradient
              colors={canJoin ? ['#7C3AED', '#5B21B6'] : ['#9CA3AF', '#6B7280']}
              style={styles.joinBtn}
            >
              {isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.joinBtnText}>Join Class</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Info section */}
        <View style={styles.info}>
          <Text style={styles.infoTitle}>How to get a class code?</Text>
          <View style={styles.infoStep}>
            <View style={styles.stepDot}><Text style={styles.stepNum}>1</Text></View>
            <Text style={styles.stepText}>Ask your teacher to share the class code</Text>
          </View>
          <View style={styles.infoStep}>
            <View style={styles.stepDot}><Text style={styles.stepNum}>2</Text></View>
            <Text style={styles.stepText}>Enter the 7-character code above</Text>
          </View>
          <View style={styles.infoStep}>
            <View style={styles.stepDot}><Text style={styles.stepNum}>3</Text></View>
            <Text style={styles.stepText}>Tap Join Class — you're in!</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },
  flex: { flex: 1 },

  // Header
  header: {
    paddingTop: 16, paddingBottom: 32,
    paddingHorizontal: 24, alignItems: 'center',
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 20 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  iconEmoji: { fontSize: 30 },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 6 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },

  // Card
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24,
    marginHorizontal: 20, marginTop: -16,
    padding: 24,
    shadowColor: '#7C3AED', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardLabel: { fontSize: 13, fontWeight: '700', color: '#4C1D95', marginBottom: 2 },
  cardHint: { fontSize: 12, color: '#9CA3AF', marginBottom: 20 },

  // Code boxes
  boxRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 10 },
  box: {
    width: 38, height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
  },
  boxEmpty: { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' },
  boxFilled: { backgroundColor: '#EDE9FE', borderColor: '#7C3AED' },
  boxActive: { borderColor: '#7C3AED', borderWidth: 2.5, backgroundColor: '#F5F3FF' },
  boxChar: { fontSize: 20, fontWeight: '800', color: '#4C1D95', letterSpacing: 0 },
  boxPlaceholder: { color: '#C4B5FD', fontSize: 22, fontWeight: '300' },

  hiddenInput: {
    position: 'absolute', opacity: 0, width: 1, height: 1,
  },

  charCount: {
    textAlign: 'center', color: '#9CA3AF', fontSize: 12,
    fontWeight: '600', marginBottom: 20,
  },

  joinBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  joinBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  // Info section
  info: { paddingHorizontal: 24, paddingTop: 28 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#4C1D95', marginBottom: 16 },
  infoStep: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  stepDot: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  stepNum: { color: '#7C3AED', fontSize: 12, fontWeight: '800' },
  stepText: { color: '#6B7280', fontSize: 13, flex: 1, lineHeight: 18 },
});
