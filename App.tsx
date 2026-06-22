import React from 'react';
import { View, ActivityIndicator, Text, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { Colors } from './constants/theme';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#1a0a35', padding: 20, paddingTop: 60 }}>
          <Text style={{ color: '#ff6b6b', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            App Crash — Error Details:
          </Text>
          <Text style={{ color: '#fff', fontSize: 13, marginBottom: 8 }}>
            {this.state.error.toString()}
          </Text>
          <Text style={{ color: '#c9a0dc', fontSize: 11 }}>
            {this.state.error.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primaryDark }}>
        <ActivityIndicator size="large" color={Colors.primarySoft} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <AppNavigator />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
