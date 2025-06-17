import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // adatta il path se necessario

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato dentro un AuthProvider');
  }
  return context;
}