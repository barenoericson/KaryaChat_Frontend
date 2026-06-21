import Constants from 'expo-constants';

function getApiUrl(): string {
  if (!__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL ?? 'https://karyachat-backend.onrender.com';
  }

  // In development, Expo knows what IP the dev server is running on.
  // Extract that host and point the backend to the same machine on port 3000.
  // This works automatically on both Android and iOS without changing .env.
  const expoHost =
    Constants.expoConfig?.hostUri?.split(':')[0] ??
    Constants.manifest2?.extra?.expoClient?.hostUri?.split(':')[0];

  if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
    return `http://${expoHost}:3000`;
  }

  return process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
}

export const API_BASE_URL = getApiUrl();
export const SOCKET_URL = API_BASE_URL;
