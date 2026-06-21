import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, Alert, SafeAreaView, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { classesService } from '../../services/classes.service';
import { TeacherStackParamList } from '../../navigation/types';

type RoutePropType = RouteProp<TeacherStackParamList, 'CreateLesson'>;

export default function CreateLessonScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RoutePropType>();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [order, setOrder] = useState('');
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');

  const { mutate: createLesson, isPending } = useMutation({
    mutationFn: () => {
      let deadline: string | undefined;
      if (hasDeadline && deadlineDate.trim()) {
        const dateStr = deadlineTime.trim()
          ? `${deadlineDate.trim()}T${deadlineTime.trim()}:00`
          : `${deadlineDate.trim()}T23:59:00`;
        deadline = new Date(dateStr).toISOString();
      }
      return classesService.createLesson(params.classId, {
        title: title.trim(),
        content: content.trim(),
        codeSnippet: codeSnippet.trim() || undefined,
        order: order.trim() ? parseInt(order, 10) : undefined,
        deadline,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-detail', params.classId] });
      navigation.goBack();
    },
    onError: () => Alert.alert('Error', 'Failed to create lesson. Please try again.'),
  });

  const handleSubmit = () => {
    if (!title.trim()) return Alert.alert('Required', 'Lesson title is required.');
    if (!content.trim()) return Alert.alert('Required', 'Lesson content is required.');
    if (order.trim() && isNaN(parseInt(order, 10))) {
      return Alert.alert('Validation', 'Order must be a number.');
    }
    if (hasDeadline) {
      if (!deadlineDate.trim()) return Alert.alert('Required', 'Please enter the deadline date (YYYY-MM-DD).');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(deadlineDate.trim())) {
        return Alert.alert('Format', 'Date must be in YYYY-MM-DD format (e.g. 2026-06-30).');
      }
      if (deadlineTime.trim() && !/^\d{2}:\d{2}$/.test(deadlineTime.trim())) {
        return Alert.alert('Format', 'Time must be in HH:MM format (e.g. 23:59).');
      }
    }
    createLesson();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Add Lesson</Text>
          <Text style={styles.headerSub}>Create engaging content for your students</Text>
        </LinearGradient>

        <View style={styles.form}>
          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Lesson Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Variables and Data Types"
              placeholderTextColor="#A78BCC"
              value={title}
              onChangeText={setTitle}
              maxLength={255}
            />
          </View>

          {/* Content */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Content <Text style={styles.required}>*</Text></Text>
            <Text style={styles.hint}>Explain the lesson topic, concepts, and instructions</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Explain the lesson topic in detail…"
              placeholderTextColor="#A78BCC"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Code snippet */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Code Snippet <Text style={styles.optional}>(optional)</Text></Text>
            <Text style={styles.hint}>Paste example code for students to study or modify</Text>
            <View style={styles.codeContainer}>
              <View style={styles.codeDots}>
                <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
                <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
                <View style={[styles.dot, { backgroundColor: '#28C840' }]} />
              </View>
              <TextInput
                style={styles.codeInput}
                placeholder="# Paste your code example here"
                placeholderTextColor="#6B7280"
                value={codeSnippet}
                onChangeText={setCodeSnippet}
                multiline
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
          </View>

          {/* Order */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Lesson Order <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.shortInput]}
              placeholder="e.g. 1"
              placeholderTextColor="#A78BCC"
              value={order}
              onChangeText={setOrder}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>

          {/* Deadline */}
          <View style={styles.deadlineCard}>
            <View style={styles.deadlineHeader}>
              <View>
                <Text style={styles.deadlineTitle}>Set Submission Deadline</Text>
                <Text style={styles.deadlineDesc}>Students see this as their due date</Text>
              </View>
              <Switch
                value={hasDeadline}
                onValueChange={setHasDeadline}
                trackColor={{ false: '#DDD6FE', true: '#7C3AED' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {hasDeadline && (
              <View style={styles.deadlineFields}>
                <View style={styles.dateTimeRow}>
                  <View style={styles.dateField}>
                    <Text style={styles.dtLabel}>Date (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.dtInput}
                      placeholder="2026-06-30"
                      placeholderTextColor="#A78BCC"
                      value={deadlineDate}
                      onChangeText={setDeadlineDate}
                      maxLength={10}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                  <View style={styles.timeField}>
                    <Text style={styles.dtLabel}>Time (HH:MM)</Text>
                    <TextInput
                      style={styles.dtInput}
                      placeholder="23:59"
                      placeholderTextColor="#A78BCC"
                      value={deadlineTime}
                      onChangeText={setDeadlineTime}
                      maxLength={5}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>
                <Text style={styles.dtHint}>Leave time blank to default to 11:59 PM</Text>
              </View>
            )}
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={isPending}
            style={({ pressed }) => [{ opacity: pressed || isPending ? 0.7 : 1, marginTop: 8 }]}
          >
            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.submitBtn}>
              <Text style={styles.submitText}>
                {isPending ? 'Saving Lesson…' : 'Save Lesson'}
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
  hint: { fontSize: 12, color: '#7C3AED', marginBottom: 8 },

  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#DDD6FE',
    borderRadius: 14, padding: 14, fontSize: 15, color: '#1F1235',
  },
  textarea: { height: 140, textAlignVertical: 'top' },
  shortInput: { width: 120 },

  codeContainer: {
    backgroundColor: '#1E1B2E', borderRadius: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: '#4C1D95',
  },
  codeDots: { flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  codeInput: {
    color: '#A5F3FC', fontFamily: 'monospace', fontSize: 13,
    padding: 14, paddingTop: 4, minHeight: 120, textAlignVertical: 'top',
  },

  deadlineCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: '#DDD6FE', marginBottom: 22,
  },
  deadlineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deadlineTitle: { fontSize: 15, fontWeight: '700', color: '#4C1D95' },
  deadlineDesc: { fontSize: 12, color: '#7C3AED', marginTop: 2 },
  deadlineFields: { marginTop: 16 },
  dateTimeRow: { flexDirection: 'row', gap: 12 },
  dateField: { flex: 2 },
  timeField: { flex: 1 },
  dtLabel: { fontSize: 11, fontWeight: '600', color: '#6D28D9', marginBottom: 6 },
  dtInput: {
    backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#DDD6FE',
    borderRadius: 10, padding: 10, fontSize: 14, color: '#1F1235',
  },
  dtHint: { fontSize: 11, color: '#9CA3AF', marginTop: 8 },

  submitBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
