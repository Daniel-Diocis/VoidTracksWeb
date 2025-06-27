/**
 * Contesto di autenticazione globale per l'intera applicazione.
 * Fornisce:
 * - Utente loggato e ruolo (user/admin)
 * - Token JWT e conteggio dei token disponibili
 * - Stato di login e inizializzazione
 * - Funzioni per login, logout e aggiornamento dei token
 *
 * I dati persistono in `localStorage` per mantenere la sessione anche dopo il refresh.
 */

import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/** Tipo che descrive i dati utente minimi necessari */
interface UserData {
  username: string;
  role: 'admin' | 'user';
}

/** Tipo del contesto condiviso per l'autenticazione */
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

/** Creazione del contesto di autenticazione */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Props del provider: contiene i componenti figli */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider
 *
 * Provider React che avvolge l'applicazione e gestisce lo stato di autenticazione globale.
 * Carica i dati da localStorage al primo rendering (persistenza sessione).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokens, setTokens] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState(true);

  // L'utente è loggato se user e token sono presenti
  const isLoggedIn = !!user && !!token;

  // Al montaggio, carica i dati salvati in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedTokens = localStorage.getItem('tokens');

    console.log('Loaded from localStorage:', { savedToken, savedUser, savedTokens });

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser)); // converti da JSON stringa a oggetto
      setTokens(savedTokens ? Number(savedTokens) : 0);
    }
    setIsInitializing(false);
  }, []);

  /**
   * login
   *
   * Salva i dati dell'utente loggato nello stato e in localStorage.
   */
  const login = (userData: UserData, token: string, tokensCount: number) => {
    setUser(userData);
    setToken(token);
    setTokens(tokensCount);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData)); // ✅ salva come JSON stringa
    localStorage.setItem('tokens', tokensCount.toString());
  };

  /**
   * logout
   *
   * Rimuove tutti i dati dell'utente sia dallo stato che da localStorage.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    setTokens(0);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
  };

  /**
   * updateTokens
   *
   * Aggiorna solo il numero di token, utile ad esempio dopo un acquisto.
   */
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