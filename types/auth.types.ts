export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isEmailVerified: boolean;
}
