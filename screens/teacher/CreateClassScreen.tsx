import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  ScrollView, StyleSheet, Alert, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { classesService } from '../../services/classes.service';

const PRESET_LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java',
  'Kotlin', 'Swift', 'C', 'C++', 'C#',
  'PHP', 'Ruby', 'Go', 'Rust', 'Dart / Flutter', 'Other',
];

const LANG_ICONS: Record<string, string> = {
  Python: '🐍', JavaScript: '🟨', TypeScript: '🔷', Java: '☕',
  Kotlin: '🟣', Swift: '🍎', C: '⚙️', 'C++': '⚙️', 'C#': '💠',
  PHP: '🐘', Ruby: '💎', Go: '🐹', Rust: '🦀', 'Dart / Flutter': '🎯', Other: '✏️',
};

export default function CreateClassScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [customLang, setCustomLang] = useState('');

  const language = selectedLang === 'Other' ? customLang.trim() : selectedLang;

  const { mutate: createClass, isPending } = useMutation({
    mutationFn: classesService.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] });
      navigation.goBack();
    },
    onError: () => Alert.alert('Error', 'Failed to create class. Please try again.'),
  });

  const handleSubmit = () => {
    if (!name.trim()) return Alert.alert('Required', 'Class name is required.');
    if (!language) return Alert.alert('Required', 'Please select or enter a programming language.');
    if (selectedLang === 'Other' && customLang.trim().length < 2) {
      return Alert.alert('Required', 'Please specify the programming language.');
    }
    createClass({ name: name.trim(), description: description.trim() || undefined, language });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Create a Class</Text>
          <Text style={styles.headerSub}>Set up your new programming class</Text>
        </LinearGradient>

        <View style={styles.form}>
          {/* Class name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Class Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Intro to Python"
              placeholderTextColor="#A78BCC"
              value={name}
              onChangeText={setName}
              maxLength={255}
            />
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="What will students learn in this class?"
              placeholderTextColor="#A78BCC"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={1000}
              textAlignVertical="top"
            />
          </View>

          {/* Language */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Programming Language <Text style={styles.required}>*</Text></Text>
            <Text style={styles.hint}>Select one or choose Other to specify</Text>
            <View style={styles.langGrid}>
              {PRESET_LANGUAGES.map((lang) => {
                const isActive = selectedLang === lang;
                return (
                  <Pressable
                    key={lang}
                    style={[styles.langChip, isActive && styles.langChipActive]}
                    onPress={() => setSelectedLang(lang)}
                  >
                    <Text style={styles.langEmoji}>{LANG_ICONS[lang]}</Text>
                    <Text style={[styles.langChipText, isActive && styles.langChipTextActive]}>
                      {lang}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedLang === 'Other' && (
              <TextInput
                style={[styles.input, styles.customLangInput]}
                placeholder="e.g. Solidity, Haskell, Assembly…"
                placeholderTextColor="#A78BCC"
                value={customLang}
                onChangeText={setCustomLang}
                maxLength={100}
                autoFocus
              />
            )}
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={isPending}
            style={({ pressed }) => [{ opacity: pressed || isPending ? 0.7 : 1 }]}
          >
            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.submitBtn}>
              <Text style={styles.submitText}>
                {isPending ? 'Creating Class…' : 'Create Class'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },
  container: { flex: 1 },
  content: { paddingBottom: 40 },

  header: {
    paddingTop: 16, paddingBottom: 28,
    paddingHorizontal: 20,
  },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },

  form: { padding: 20 },

  fieldGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', color: '#4C1D95', marginBottom: 4 },
  required: { color: '#EF4444' },
  optional: { color: '#9CA3AF', fontWeight: '400', fontSize: 12 },
  hint: { fontSize: 12, color: '#7C3AED', marginBottom: 10 },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#1F1235',
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  customLangInput: { marginTop: 12 },

  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 24, borderWidth: 1.5,
    borderColor: '#DDD6FE', backgroundColor: '#FFFFFF',
  },
  langChipActive: {
    backgroundColor: '#7C3AED', borderColor: '#7C3AED',
  },
  langEmoji: { fontSize: 14 },
  langChipText: { color: '#6D28D9', fontSize: 13, fontWeight: '600' },
  langChipTextActive: { color: '#FFFFFF' },

  submitBtn: {
    borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
