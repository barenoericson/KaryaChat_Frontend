import { apiClient } from './api.client';

export interface Submission {
  id: string;
  studentId: string;
  lessonId: string;
  classId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  submittedAt: string;
  student?: { id: string; username: string; email: string };
}

export const submissionsService = {
  submit: async (
    classId: string,
    lessonId: string,
    file: { uri: string; name: string; type: string },
  ): Promise<Submission> => {
    const form = new FormData();
    form.append('file', { uri: file.uri, name: file.name, type: file.type } as any);
    const { data } = await apiClient.post<Submission>(
      `/classes/${classId}/lessons/${lessonId}/submissions`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  getForLesson: async (classId: string, lessonId: string): Promise<Submission[]> => {
    const { data } = await apiClient.get<Submission[]>(
      `/classes/${classId}/lessons/${lessonId}/submissions`,
    );
    return data;
  },

  getMySubmission: async (classId: string, lessonId: string): Promise<Submission | null> => {
    const { data } = await apiClient.get<Submission | null>(
      `/classes/${classId}/lessons/${lessonId}/submissions/mine`,
    );
    return data;
  },
};
