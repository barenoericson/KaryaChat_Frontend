import { apiClient } from './api.client';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  codeSnippet: string | null;
  order: number;
  classId: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSummary {
  id: string;
  name: string;
  description: string | null;
  language: string;
  classCode: string;
  isArchived: boolean;
  teacherId: string;
  lessons?: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassDetail extends ClassSummary {
  teacher: { id: string; username: string; email: string };
  students: { id: string; username: string }[];
  lessons: Lesson[];
}

export interface CreateClassPayload {
  name: string;
  description?: string;
  language: string;
}

export interface CreateLessonPayload {
  title: string;
  content: string;
  codeSnippet?: string;
  order?: number;
  deadline?: string;
}

// ─── Exam types ──────────────────────────────────────────────────────────────

export interface ExamQuestion {
  type: 'mcq' | 'fill' | 'short' | 'coding' | 'open-ended' | 'essay';
  question: string;
  options?: string[];
  answer: string;
  maxScore?: number;
  explanation?: string;
}

export interface Exam {
  id: string;
  classId: string;
  lessonId: null;
  createdBy: string;
  isExam: boolean;
  title: string;
  rubric: string;
  questions: ExamQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamAnswer {
  questionIndex: number;
  answer: string;
  aiScore?: number;
  aiFeedback?: string;
  teacherScore?: number | null;
  teacherNote?: string;
}

export interface ExamResult {
  id: string;
  quizId: string;
  studentId: string;
  answers: ExamAnswer[];
  correct: number;
  total: number;
  score: number;
  isGraded: boolean;
  quiz: Exam;
  student: { id: string; username: string; email: string };
  completedAt: string;
}

export const classesService = {
  // Teacher
  getMyClasses: async (): Promise<ClassSummary[]> => {
    const { data } = await apiClient.get<ClassSummary[]>('/classes/mine');
    return data;
  },

  createClass: async (payload: CreateClassPayload): Promise<ClassSummary> => {
    const { data } = await apiClient.post<ClassSummary>('/classes', payload);
    return data;
  },

  updateClass: async (
    id: string,
    payload: Partial<CreateClassPayload & { isArchived: boolean }>,
  ): Promise<ClassSummary> => {
    const { data } = await apiClient.patch<ClassSummary>(`/classes/${id}`, payload);
    return data;
  },

  deleteClass: async (id: string): Promise<void> => {
    await apiClient.delete(`/classes/${id}`);
  },

  createLesson: async (classId: string, payload: CreateLessonPayload): Promise<Lesson> => {
    const { data } = await apiClient.post<Lesson>(`/classes/${classId}/lessons`, payload);
    return data;
  },

  updateLesson: async (
    classId: string,
    lessonId: string,
    payload: Partial<CreateLessonPayload>,
  ): Promise<Lesson> => {
    const { data } = await apiClient.patch<Lesson>(
      `/classes/${classId}/lessons/${lessonId}`,
      payload,
    );
    return data;
  },

  deleteLesson: async (classId: string, lessonId: string): Promise<void> => {
    await apiClient.delete(`/classes/${classId}/lessons/${lessonId}`);
  },

  // Student
  getEnrolledClasses: async (): Promise<ClassSummary[]> => {
    const { data } = await apiClient.get<ClassSummary[]>('/classes/enrolled');
    return data;
  },

  joinClass: async (classCode: string): Promise<ClassSummary> => {
    const { data } = await apiClient.post<ClassSummary>('/classes/join', { classCode });
    return data;
  },

  leaveClass: async (classId: string): Promise<void> => {
    await apiClient.delete(`/classes/${classId}/leave`);
  },

  // Shared
  getClassDetail: async (id: string): Promise<ClassDetail> => {
    const { data } = await apiClient.get<ClassDetail>(`/classes/${id}`);
    return data;
  },

  getLessons: async (classId: string): Promise<Lesson[]> => {
    const { data } = await apiClient.get<Lesson[]>(`/classes/${classId}/lessons`);
    return data;
  },

  getLesson: async (classId: string, lessonId: string): Promise<Lesson> => {
    const { data } = await apiClient.get<Lesson>(`/classes/${classId}/lessons/${lessonId}`);
    return data;
  },

  // ─── Exams ───────────────────────────────────────────────────────────────

  createExam: async (
    classId: string,
    payload: { title: string; rubric: string; questions: ExamQuestion[] },
  ): Promise<Exam> => {
    const { data } = await apiClient.post<Exam>(`/classes/${classId}/exams`, payload);
    return data;
  },

  getExams: async (classId: string): Promise<Exam[]> => {
    const { data } = await apiClient.get<Exam[]>(`/classes/${classId}/exams`);
    return data;
  },

  getExam: async (classId: string, examId: string): Promise<Exam> => {
    const { data } = await apiClient.get<Exam>(`/classes/${classId}/exams/${examId}`);
    return data;
  },

  submitExam: async (
    classId: string,
    examId: string,
    answers: { questionIndex: number; answer: string }[],
  ): Promise<ExamResult> => {
    const { data } = await apiClient.post<ExamResult>(
      `/classes/${classId}/exams/${examId}/submit`,
      { answers },
    );
    return data;
  },

  getExamResults: async (classId: string, examId: string): Promise<ExamResult[]> => {
    const { data } = await apiClient.get<ExamResult[]>(`/classes/${classId}/exams/${examId}/results`);
    return data;
  },

  getMyExamResult: async (classId: string, examId: string): Promise<ExamResult | null> => {
    const { data } = await apiClient.get<ExamResult | null>(
      `/classes/${classId}/exams/${examId}/my-result`,
    );
    return data;
  },

  overrideGrades: async (
    classId: string,
    examId: string,
    resultId: string,
    overrides: { questionIndex: number; score: number; note?: string }[],
  ): Promise<ExamResult> => {
    const { data } = await apiClient.patch<ExamResult>(
      `/classes/${classId}/exams/${examId}/results/${resultId}`,
      { overrides },
    );
    return data;
  },
};
