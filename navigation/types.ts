// All navigation param lists in one place — prevents circular imports between
// AppNavigator (which imports screens) and screens (which need these types).

export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  Guest: undefined;
};

export type TeacherStackParamList = {
  TeacherTabs: undefined;
  CreateClass: undefined;
  EditClass: { classId: string };
  TeacherClassDetail: { classId: string };
  CreateLesson: { classId: string };
  EditLesson: { classId: string; lessonId: string };
  LessonDetail: { classId: string; lessonId: string };
  QuizResults: { classId: string; lessonId: string; lessonTitle: string };
  CreateExam: { classId: string };
  ExamResults: { classId: string; examId: string; examTitle: string };
};

export type StudentStackParamList = {
  StudentTabs: undefined;
  JoinClass: undefined;
  StudentClassDetail: { classId: string };
  LessonDetail: { classId: string; lessonId: string };
  TakeQuiz: { classId: string; lessonId: string; lessonTitle: string };
  QuizResultDetail: { classId: string; lessonId: string };
  Playground: { code?: string; language?: string };
  TakeExam: { classId: string; examId: string; examTitle: string };
  ExamResult: { classId: string; examId: string };
};
