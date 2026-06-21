import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, FlatList,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LANGUAGES, Language, runCode, PistonResult } from '../../services/piston.service';

type RouteParams = { code?: string; language?: string };

export default function PlaygroundScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = (route.params ?? {}) as RouteParams;

  const initialLang =
    LANGUAGES.find((l) => l.id === params.language) ?? LANGUAGES[0];

  const [selectedLang, setSelectedLang] = useState<Language>(initialLang);
  const [code, setCode] = useState(params.code ?? initialLang.placeholder);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PistonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const outputRef = useRef<ScrollView>(null);

  const handleLangSelect = (lang: Language) => {
    setSelectedLang(lang);
    if (!params.code) {
      setCode(lang.placeholder);
    }
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await runCode(selectedLang, code);
      setResult(res);
      setTimeout(() => outputRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to connect to the code runner. Check your internet connection.');
    } finally {
      setRunning(false);
    }
  };

  const handleClear = () => {
    setCode(selectedLang.placeholder);
    setResult(null);
    setError(null);
  };

  const canGoBack = navigation.canGoBack();
  const hasOutput = result !== null || error !== null;

  return (
    <View style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#0E0E28', '#1A1035']} style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerRow}>
          {canGoBack && (
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </Pressable>
          )}
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>Code Playground</Text>
            <Text style={styles.headerSub}>Write, run, and experiment</Text>
          </View>
          <Pressable onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearText}>Reset</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Language selector */}
      <View style={styles.langBar}>
        <FlatList
          data={LANGUAGES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.langList}
          renderItem={({ item }) => {
            const active = item.id === selectedLang.id;
            return (
              <Pressable
                onPress={() => handleLangSelect(item)}
                style={[
                  styles.langChip,
                  active && { backgroundColor: item.color, borderColor: item.color },
                ]}
              >
                <Text style={[styles.langChipText, active && styles.langChipTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={outputRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Editor */}
          <View style={styles.editorContainer}>
            {/* Editor title bar */}
            <View style={styles.editorTitleBar}>
              <View style={styles.dots}>
                <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
                <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
                <View style={[styles.dot, { backgroundColor: '#28C840' }]} />
              </View>
              <Text style={styles.editorFileName}>
                main
                {selectedLang.id === 'python' ? '.py'
                  : selectedLang.id === 'javascript' ? '.js'
                  : selectedLang.id === 'typescript' ? '.ts'
                  : selectedLang.id === 'java' ? '.java'
                  : selectedLang.id === 'c++' ? '.cpp'
                  : selectedLang.id === 'c' ? '.c'
                  : selectedLang.id === 'go' ? '.go'
                  : selectedLang.id === 'rust' ? '.rs'
                  : selectedLang.id === 'ruby' ? '.rb'
                  : selectedLang.id === 'php' ? '.php'
                  : selectedLang.id === 'kotlin' ? '.kt'
                  : '.txt'}
              </Text>
              <View style={[styles.langDot, { backgroundColor: selectedLang.color }]} />
            </View>

            {/* Code input */}
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={setCode}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              placeholder="// Write your code here..."
              placeholderTextColor="#4B5563"
              scrollEnabled={false}
            />
          </View>

          {/* Run button */}
          <Pressable
            onPress={handleRun}
            disabled={running}
            style={({ pressed }) => [{ opacity: pressed || running ? 0.75 : 1 }]}
          >
            <LinearGradient
              colors={running ? ['#374151', '#374151'] : ['#059669', '#047857']}
              style={styles.runBtn}
            >
              {running ? (
                <View style={styles.runBtnInner}>
                  <ActivityIndicator color="#FFF" size="small" />
                  <Text style={styles.runBtnText}>Running...</Text>
                </View>
              ) : (
                <View style={styles.runBtnInner}>
                  <Text style={styles.runBtnIcon}>▶</Text>
                  <Text style={styles.runBtnText}>Run Code</Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>

          {/* Output panel */}
          {hasOutput && (
            <View style={styles.outputContainer}>
              <View style={styles.outputTitleBar}>
                <View style={styles.dots}>
                  <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
                  <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
                  <View style={[styles.dot, { backgroundColor: '#28C840' }]} />
                </View>
                <Text style={styles.outputTitle}>Output</Text>
                {result && (
                  <View style={[
                    styles.exitBadge,
                    { backgroundColor: result.code === 0 ? '#065F46' : '#7F1D1D' },
                  ]}>
                    <Text style={styles.exitBadgeText}>
                      exit {result.code}
                    </Text>
                  </View>
                )}
              </View>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : result ? (
                <>
                  {result.stdout ? (
                    <Text style={styles.stdoutText}>{result.stdout}</Text>
                  ) : null}
                  {result.stderr ? (
                    <Text style={styles.stderrText}>{result.stderr}</Text>
                  ) : null}
                  {!result.stdout && !result.stderr && (
                    <Text style={styles.emptyOutput}>
                      (no output)
                    </Text>
                  )}
                </>
              ) : null}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080818' },

  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  headerTitleBlock: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 1 },
  clearBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10,
  },
  clearText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },

  langBar: { backgroundColor: '#0E0E28', borderBottomWidth: 1, borderBottomColor: 'rgba(123,47,190,0.2)' },
  langList: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  langChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'transparent',
  },
  langChipText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700' },
  langChipTextActive: { color: '#FFFFFF' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48, gap: 14 },

  editorContainer: {
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.3)',
  },
  editorTitleBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1035', paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(123,47,190,0.2)',
  },
  dots: { flexDirection: 'row', gap: 6, marginRight: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  editorFileName: { color: 'rgba(255,255,255,0.5)', fontSize: 12, flex: 1 },
  langDot: { width: 8, height: 8, borderRadius: 4 },

  codeInput: {
    backgroundColor: '#0E0E28',
    color: '#A5F3FC',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 22,
    padding: 16,
    minHeight: 240,
    textAlignVertical: 'top',
  },

  runBtn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  runBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  runBtnIcon: { color: '#FFFFFF', fontSize: 14 },
  runBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  outputContainer: {
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(123,47,190,0.3)',
  },
  outputTitleBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1035', paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(123,47,190,0.2)',
  },
  outputTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12, flex: 1 },
  exitBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  exitBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

  stdoutText: {
    backgroundColor: '#0E0E28',
    color: '#86EFAC',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 22,
    padding: 16,
  },
  stderrText: {
    backgroundColor: '#0E0E28',
    color: '#FCA5A5',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 22,
    padding: 16,
  },
  errorText: {
    backgroundColor: '#0E0E28',
    color: '#FCA5A5',
    fontSize: 13,
    padding: 16,
    lineHeight: 20,
  },
  emptyOutput: {
    backgroundColor: '#0E0E28',
    color: 'rgba(255,255,255,0.3)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    padding: 16,
    fontStyle: 'italic',
  },
});
