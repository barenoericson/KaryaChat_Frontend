import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthUser } from '../types/auth.types';
import { apiClient } from '../services/api.client';

const SECURE_KEY_TOKEN = 'codemate_auth_token';
const SECURE_KEY_USER = 'codemate_auth_user';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(SECURE_KEY_TOKEN);
      const storedUser = await SecureStore.getItemAsync(SECURE_KEY_USER);
      if (storedToken && storedUser) {
        setToken(storedToken);
        // Load cached user immediately so the app renders fast
        setUser(JSON.parse(storedUser) as AuthUser);
        // Then refresh from server to pick up avatar / profile changes
        try {
          const { data } = await apiClient.get<AuthUser>('/users/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const fresh: AuthUser = {
            id: data.id,
            email: data.email,
            username: data.username,
            role: data.role,
            avatar: (data as any).avatar ?? null,
            bio: (data as any).bio ?? null,
            isEmailVerified: data.isEmailVerified,
          };
          setUser(fresh);
          await SecureStore.setItemAsync(SECURE_KEY_USER, JSON.stringify(fresh));
        } catch {
          // Server unreachable — keep cached user, don't log out
        }
      }
    } catch {
      // Corrupted secure store entry — start fresh
      await SecureStore.deleteItemAsync(SECURE_KEY_TOKEN);
      await SecureStore.deleteItemAsync(SECURE_KEY_USER);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newUser: AuthUser) => {
    await SecureStore.setItemAsync(SECURE_KEY_TOKEN, newToken);
    await SecureStore.setItemAsync(SECURE_KEY_USER, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(SECURE_KEY_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_KEY_USER);
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updatedUser: AuthUser) => {
    await SecureStore.setItemAsync(SECURE_KEY_USER, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
