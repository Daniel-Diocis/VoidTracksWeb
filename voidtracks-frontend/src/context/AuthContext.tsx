import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  user: string | null;         // username o altro identificativo
  token: string | null;        // JWT token
  tokens: number;              // tokens utente da DB, default 0
  isLoggedIn: boolean;
  login: (username: string, token: string, tokens: number) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokens, setTokens] = useState<number>(0);

  const isLoggedIn = !!user && !!token;

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedTokens = localStorage.getItem('tokens');
    console.log('Loaded from localStorage:', { savedToken, savedUser, savedTokens });
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      setTokens(savedTokens ? Number(savedTokens) : 0);
    }
  }, []);

  const login = (username: string, token: string, tokensCount: number) => {
    setUser(username);
    setToken(token);
    setTokens(tokensCount);
    localStorage.setItem('token', token);
    localStorage.setItem('user', username);
    localStorage.setItem('tokens', tokensCount.toString());
    console.log('Saved to localStorage:', { username, token, tokensCount });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTokens(0);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
  };

  return (
    <AuthContext.Provider value={{ user, token, tokens, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}