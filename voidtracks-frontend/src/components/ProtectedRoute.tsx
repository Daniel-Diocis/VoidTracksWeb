import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export function ProtectedRoute() {
  const auth = useContext(AuthContext);

  if (!auth) return null; // oppure un loading spinner

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const auth = useContext(AuthContext);

  if (!auth) return null; // loading spinner

  if (!auth.isLoggedIn || auth.user?.role !== 'admin') {
    // Qui reindirizzi alla pagina di accesso negato
    return <Navigate to="/not-authorized" replace />;
  }

  return <Outlet />;
}