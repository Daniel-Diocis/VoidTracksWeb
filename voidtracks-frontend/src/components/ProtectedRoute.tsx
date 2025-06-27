/**
 * Componenti wrapper per proteggere le rotte nell'app.
 * - `ProtectedRoute`: accessibile solo agli utenti autenticati
 * - `AdminRoute`: accessibile solo agli utenti autenticati con ruolo admin
 *
 * Utilizza React Router `Outlet` per mostrare i figli e `Navigate` per i redirect.
 */

import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute
 *
 * Restringe l'accesso alle rotte solo agli utenti autenticati.
 * Se l'utente non è loggato, viene reindirizzato alla pagina di login.
 */
export function ProtectedRoute() {
  const auth = useContext(AuthContext);

  if (!auth) return null; // oppure un loading spinner

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/**
 * AdminRoute
 *
 * Restringe l'accesso alle rotte solo agli utenti con ruolo admin.
 * Se non autorizzato, reindirizza alla pagina "non autorizzato".
 */
export function AdminRoute() {
  const auth = useContext(AuthContext);

  if (!auth) return null; // loading spinner

  if (!auth.isLoggedIn || auth.user?.role !== 'admin') {
    // Qui reindirizzi alla pagina di accesso negato
    return <Navigate to="/not-authorized" replace />;
  }

  return <Outlet />;
}