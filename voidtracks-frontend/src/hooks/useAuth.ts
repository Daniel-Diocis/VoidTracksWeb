/**
 * Hook personalizzato per accedere al contesto di autenticazione (`AuthContext`).
 * 
 * Fornisce accesso diretto allo stato e alle funzioni di autenticazione:
 * - Informazioni sull’utente loggato
 * - Token JWT
 * - Numero di token dell’utente
 * - Funzioni di login, logout e aggiornamento token
 *
 * Deve essere utilizzato **esclusivamente** all'interno di un `<AuthProvider>`.
 *
 * @throws {Error} Se usato fuori dal provider, solleva un errore esplicito.
 *
 * @returns {AuthContextType} Oggetto con lo stato e le funzioni di autenticazione.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // adatta il path se necessario

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro un AuthProvider');
  }
  return context;
}