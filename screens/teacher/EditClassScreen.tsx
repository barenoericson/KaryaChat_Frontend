import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { classesService } from '../../services/classes.service';
import { TeacherStackParamList } from '../../navigation/types';

type RoutePropType = RouteProp<TeacherStackParamList, 'EditClass'>;

const LANGUAGES = [
  { label: 'Python', emoji: '🐍' }, { label: 'JavaScript', emoji: '⚡' },
  { label: 'TypeScript', emoji: '🔷' }, { label: 'Java', emoji: '☕' },
  { label: 'Kotlin', emoji: '🟣' }, { label: 'Swift', emoji: '🍎' },
  { label: 'C++', emoji: '⚙️' }, { label: 'C#', emoji: '💠' },
  { label: 'PHP', emoji: '🐘' }, { label: 'Ruby', emoji: '💎' },
  { label: 'Go', emoji: '🐹' }, { label: 'Rust', emoji: '🦀' },
  { label: 'Dart', emoji: '🎯' }, { label: 'Flutter', emoji: '✏️' },
  { label: 'Other', emoji: '💻' },
];

export default function EditClassScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RoutePropType>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [customLang, setCustomLang] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { isLoading, data: classData } = useQuery({
    queryKey: ['class-detail', params.classId],
    queryFn: () => classesService.getClassDetail(params.classId),
  });

  useEffect(() => {
    if (classData && !loaded) {
      setName((classData as any).name ?? '');
      setDescription((classData as any).description ?? '');
      const matched = LANGUAGES.find(
        (l) => l.label.toLowerCase() === ((classData as any).language ?? '').toLowerCase(),
      );
      if (matched) {
        setSelectedLang(matched.label);
      } else {
        setSelectedLang('Other');
        setCustomLang((classData as any).language ?? '');
      }
      setLoaded(true);
    }
  }, [classData, loaded]);

  const { mutate: updateClass, isPending } = useMutation({
    mutationFn: () => {
      const language = selectedLang === 'Other' ? customLang.trim() : selectedLang;
      return classesService.updateClass(params.classId, {
        name: name.trim(),
        description: description.trim() || undefined,
        language,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] });
      queryClient.invalidateQueries({ queryKey: ['class-detail', params.classId] });
      navigation.goBack();
    },
    onError: () => Alert.alert('Error', 'Failed to update class. Please try again.'),
  });

  const handleSubmit = () => {
    if (!name.trim()) return Alert.alert('Required', 'Class name is required.');
    if (!selectedLang) return Alert.alert('Required', 'Please select a programming language.');
    if (selectedLang === 'Other' && customLang.trim().length < 2) {
      return Alert.alert('Required', 'Please enter the programming language name.');
    }
    updateClass();
  };

  if (isLoading && !loaded) {
    return (
      <View style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <LinearGradient colors={['#7C3AED', '#5B21B6']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Edit Class</Text>
          <Text style={styles.headerSub}>Update your class information</Text>
        </LinearGradient>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Class Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Intro to Python Programming"
              placeholderTextColor="#A78BCC"
              value={name}
              onChangeText={setName}
              maxLength={100}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="What will students learn in this class?"
              placeholderTextColor="#A78BCC"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Programming Language <Text style={styles.required}>*</Text></Text>
            <Text style={styles.hint}>Select the primary language for this class</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.label}
                  style={[styles.langChip, selectedLang === lang.label && styles.langChipSelected]}
                  onPress={() => setSelectedLang(lang.label)}
                >
                  <Text style={styles.langEmoji}>{lang.emoji}</Text>
                  <Text style={[styles.langText, selectedLang === lang.label && styles.langTextSelected]}>
                    {lang.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {selectedLang === 'Other' && (
              <TextInput
                style={[styles.input, { marginTop: 12 }]}
                placeholder="Enter language name (e.g. Lua, Prolog)"
                placeholderTextColor="#A78BCC"
                value={customLang}
                onChangeText={setCustomLang}
                maxLength={50}
              />
            )}
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={isPending}
            style={({ pressed }) => [{ opacity: pressed || isPending ? 0.7 : 1, marginTop: 8 }]}
          >
            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.submitBtn}>
              <Text style={styles.submitText}>
                {isPending ? 'Saving…' : 'Save Changes'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { paddingTop: 16, paddingBottom: 28, paddingHorizontal: 20 },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },

  form: { padding: 20 },
  fieldGroup: { marginBottom: 22 },
  label: { fontSize: 14, fontWeight: '700', color: '#4C1D95', marginBottom: 4 },
  required: { color: '#EF4444' },
  optional: { color: '#9CA3AF', fontWeight: '400', fontSize: 12 },
  hint: { fontSize: 12, color: '#7C3AED', marginBottom: 10 },

  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#DDD6FE',
    borderRadius: 14, padding: 14, fontSize: 15, color: '#1F1235',
  },
  textarea: { height: 120, textAlignVertical: 'top' },

  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#DDD6FE',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  langChipSelected: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  langEmoji: { fontSize: 14 },
  langText: { fontSize: 12, fontWeight: '600', color: '#4C1D95' },
  langTextSelected: { color: '#FFFFFF' },

  submitBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
