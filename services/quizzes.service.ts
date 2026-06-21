import { apiClient } from './api.client';

export interface QuizQuestion {
  type: 'mcq' | 'fill' | 'short';
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  classId: string;
  lessonId: string;
  createdBy: string;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface SubmittedAnswer {
  questionIndex: number;
  answer: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  answers: SubmittedAnswer[];
  correct: number;
  total: number;
  score: number;
  completedAt: string;
  student?: { id: string; username: string; email: string };
  quiz?: Quiz;
}

export const quizzesService = {
  generate: async (classId: string, lessonId: string): Promise<Quiz> => {
    const { data } = await apiClient.post<Quiz>(
      `/classes/${classId}/lessons/${lessonId}/quiz/generate`,
    );
    return data;
  },

  getQuiz: async (classId: string, lessonId: string): Promise<Quiz> => {
    const { data } = await apiClient.get<Quiz>(
      `/classes/${classId}/lessons/${lessonId}/quiz`,
    );
    return data;
  },

  submit: async (
    classId: string,
    lessonId: string,
    answers: SubmittedAnswer[],
  ): Promise<QuizResult> => {
    const { data } = await apiClient.post<QuizResult>(
      `/classes/${classId}/lessons/${lessonId}/quiz/submit`,
      { answers },
    );
    return data;
  },

  getResults: async (classId: string, lessonId: string): Promise<QuizResult[]> => {
    const { data } = await apiClient.get<QuizResult[]>(
      `/classes/${classId}/lessons/${lessonId}/quiz/results`,
    );
    return data;
  },

  getMyResult: async (classId: string, lessonId: string): Promise<QuizResult | null> => {
    try {
      const { data } = await apiClient.get<QuizResult>(
        `/classes/${classId}/lessons/${lessonId}/quiz/my-result`,
      );
      return data;
    } catch {
      return null;
    }
  },
};
