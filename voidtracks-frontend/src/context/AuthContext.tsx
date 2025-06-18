import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface UserData {
  username: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  tokens: number;
  isLoggedIn: boolean;
  isInitializing: boolean;
  login: (user: UserData, token: string, tokens: number) => void;
  logout: () => void;
  setTokens: (tokens: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokens, setTokens] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState(true);

  const isLoggedIn = !!user && !!token;

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedTokens = localStorage.getItem('tokens');

    console.log('Loaded from localStorage:', { savedToken, savedUser, savedTokens });

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser)); // ✅ converti da JSON stringa a oggetto
      setTokens(savedTokens ? Number(savedTokens) : 0);
    }
    setIsInitializing(false);
  }, []);

  const login = (userData: UserData, token: string, tokensCount: number) => {
    setUser(userData);
    setToken(token);
    setTokens(tokensCount);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData)); // ✅ salva come JSON stringa
    localStorage.setItem('tokens', tokensCount.toString());
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTokens(0);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
  };

  const updateTokens = (newTokens: number) => {
    setTokens(newTokens);
    localStorage.setItem('tokens', newTokens.toString());
  };

  return (
    <AuthContext.Provider
      value={{ user, token, tokens, isLoggedIn, login, logout, setTokens: updateTokens, isInitializing }}
    >
      {children}
    </AuthContext.Provider>
  );
}