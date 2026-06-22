import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types/auth.types';

import SplashScreen from '../screens/SplashScreen';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import GuestScreen from '../screens/guest/GuestScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Teacher screens
import TeacherClassesScreen from '../screens/teacher/TeacherClassesScreen';
import AiBrainstormScreen from '../screens/teacher/AiBrainstormScreen';
import TeacherClassDetailScreen from '../screens/teacher/TeacherClassDetailScreen';
import CreateClassScreen from '../screens/teacher/CreateClassScreen';
import CreateLessonScreen from '../screens/teacher/CreateLessonScreen';
import EditLessonScreen from '../screens/teacher/EditLessonScreen';
import EditClassScreen from '../screens/teacher/EditClassScreen';
import QuizResultsScreen from '../screens/teacher/QuizResultsScreen';
import CreateExamScreen from '../screens/teacher/CreateExamScreen';
import ExamResultsScreen from '../screens/teacher/ExamResultsScreen';
import TakeQuizScreen from '../screens/student/TakeQuizScreen';
import TakeExamScreen from '../screens/student/TakeExamScreen';
import ExamResultScreen from '../screens/student/ExamResultScreen';

// Student screens
import StudentClassesScreen from '../screens/student/StudentClassesScreen';
import AiTutorScreen from '../screens/student/AiTutorScreen';
import StudentClassDetailScreen from '../screens/student/StudentClassDetailScreen';
import JoinClassScreen from '../screens/student/JoinClassScreen';
import PlaygroundScreen from '../screens/student/PlaygroundScreen';

// Shared screens
import LessonDetailScreen from '../screens/shared/LessonDetailScreen';

// Admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';

// ─── Param lists ─────────────────────────────────────────────────────────────
// Imported from navigation/types.ts to avoid circular dependencies with screens

export type { AuthStackParamList, TeacherStackParamList, StudentStackParamList } from './types';
import type { AuthStackParamList, TeacherStackParamList, StudentStackParamList } from './types';

type TeacherTabParamList = {
  Home: undefined;
  AiBrainstorm: undefined;
  Classes: undefined;
  Profile: undefined;
};

type StudentTabParamList = {
  Home: undefined;
  AiTutor: undefined;
  Playground: undefined;
  Classes: undefined;
  Profile: undefined;
};

type AdminTabParamList = {
  Home: undefined;
  Users: undefined;
  Profile: undefined;
};

// ─── SVG Tab Icons ───────────────────────────────────────────────────────────

const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M9 22V12h6v10"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const BotIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={8} width={18} height={13} rx={3} stroke={color} strokeWidth={2} />
    <Path d="M9 12h.01M15 12h.01" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Path d="M9 16s1 1 3 1 3-1 3-1" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M12 8V5M9 5h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const BookIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19.5A2.5 2.5 0 016.5 17H20"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const UserIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={2} />
  </Svg>
);

const UsersIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Circle cx={9} cy={7} r={4} stroke={color} strokeWidth={2} />
    <Path
      d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const TerminalIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={3} width={20} height={18} rx={3} stroke={color} strokeWidth={2} />
    <Path d="M7 8l4 4-4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13 16h4" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ─── Shared tab bar options ──────────────────────────────────────────────────

function useTabScreenOptions() {
  const { isDark } = useTheme();
  return {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: isDark ? '#1A1033' : '#0E0E28',
      borderTopColor: isDark ? 'rgba(155,89,182,0.25)' : 'rgba(123,47,190,0.2)',
      borderTopWidth: 1,
      height: 70,
      paddingBottom: 10,
      paddingTop: 8,
    },
    tabBarActiveTintColor: isDark ? '#BB8FCE' : '#9B59B6',
    tabBarInactiveTintColor: isDark ? '#4A235A' : '#3D2E5A',
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '700' as const,
      letterSpacing: 0.3,
    },
  };
}

// ─── Tab navigators ──────────────────────────────────────────────────────────

const TeacherTab = createBottomTabNavigator<TeacherTabParamList>();

function TeacherTabs() {
  const tabOptions = useTabScreenOptions();
  return (
    <TeacherTab.Navigator screenOptions={tabOptions}>
      <TeacherTab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <TeacherTab.Screen
        name="AiBrainstorm"
        component={AiBrainstormScreen}
        options={{ tabBarLabel: 'AI Brainstorm', tabBarIcon: ({ color }) => <BotIcon color={color} /> }}
      />
      <TeacherTab.Screen
        name="Classes"
        component={TeacherClassesScreen}
        options={{ tabBarLabel: 'Classes', tabBarIcon: ({ color }) => <BookIcon color={color} /> }}
      />
      <TeacherTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <UserIcon color={color} /> }}
      />
    </TeacherTab.Navigator>
  );
}

const StudentTab = createBottomTabNavigator<StudentTabParamList>();

function StudentTabs() {
  const tabOptions = useTabScreenOptions();
  return (
    <StudentTab.Navigator screenOptions={tabOptions}>
      <StudentTab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <StudentTab.Screen
        name="AiTutor"
        component={AiTutorScreen}
        options={{ tabBarLabel: 'AI Tutor', tabBarIcon: ({ color }) => <BotIcon color={color} /> }}
      />
      <StudentTab.Screen
        name="Playground"
        component={PlaygroundScreen}
        options={{ tabBarLabel: 'Playground', tabBarIcon: ({ color }) => <TerminalIcon color={color} /> }}
      />
      <StudentTab.Screen
        name="Classes"
        component={StudentClassesScreen}
        options={{ tabBarLabel: 'Classes', tabBarIcon: ({ color }) => <BookIcon color={color} /> }}
      />
      <StudentTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <UserIcon color={color} /> }}
      />
    </StudentTab.Navigator>
  );
}

const AdminTab = createBottomTabNavigator<AdminTabParamList>();

function AdminTabs() {
  const tabOptions = useTabScreenOptions();
  return (
    <AdminTab.Navigator screenOptions={tabOptions}>
      <AdminTab.Screen
        name="Home"
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'Overview', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <AdminTab.Screen
        name="Users"
        component={AdminUsersScreen}
        options={{ tabBarLabel: 'Users', tabBarIcon: ({ color }) => <UsersIcon color={color} /> }}
      />
      <AdminTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <UserIcon color={color} /> }}
      />
    </AdminTab.Navigator>
  );
}

// ─── Role-specific root stacks ───────────────────────────────────────────────

const TeacherStack = createStackNavigator<TeacherStackParamList>();

function TeacherNavigator() {
  return (
    <TeacherStack.Navigator screenOptions={{ headerShown: false }}>
      <TeacherStack.Screen name="TeacherTabs" component={TeacherTabs} />
      <TeacherStack.Screen name="CreateClass" component={CreateClassScreen} />
      <TeacherStack.Screen name="EditClass" component={EditClassScreen} />
      <TeacherStack.Screen name="TeacherClassDetail" component={TeacherClassDetailScreen} />
      <TeacherStack.Screen name="CreateLesson" component={CreateLessonScreen} />
      <TeacherStack.Screen name="EditLesson" component={EditLessonScreen} />
      <TeacherStack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <TeacherStack.Screen name="QuizResults" component={QuizResultsScreen} />
      <TeacherStack.Screen name="CreateExam" component={CreateExamScreen} />
      <TeacherStack.Screen name="ExamResults" component={ExamResultsScreen} />
    </TeacherStack.Navigator>
  );
}

const StudentStack = createStackNavigator<StudentStackParamList>();

function StudentNavigator() {
  return (
    <StudentStack.Navigator screenOptions={{ headerShown: false }}>
      <StudentStack.Screen name="StudentTabs" component={StudentTabs} />
      <StudentStack.Screen name="JoinClass" component={JoinClassScreen} />
      <StudentStack.Screen name="StudentClassDetail" component={StudentClassDetailScreen} />
      <StudentStack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <StudentStack.Screen name="TakeQuiz" component={TakeQuizScreen} />
      <StudentStack.Screen name="QuizResultDetail" component={TakeQuizScreen} />
      <StudentStack.Screen name="Playground" component={PlaygroundScreen} />
      <StudentStack.Screen name="TakeExam" component={TakeExamScreen} />
      <StudentStack.Screen name="ExamResult" component={ExamResultScreen} />
    </StudentStack.Navigator>
  );
}

// ─── Auth stack ──────────────────────────────────────────────────────────────

const AuthStack = createStackNavigator<AuthStackParamList>();

function AuthScreens() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Landing" component={LandingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Guest" component={GuestScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Root role switcher ──────────────────────────────────────────────────────

function RoleNavigator() {
  const { user } = useAuth();

  switch (user?.role) {
    case UserRole.TEACHER:
      return <TeacherNavigator />;
    case UserRole.ADMIN:
      return <AdminTabs />;
    case UserRole.STUDENT:
    default:
      return <StudentNavigator />;
  }
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#9370DB" />
      </View>
    );
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      {token ? <RoleNavigator /> : <AuthScreens />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#080818',
  },
});
