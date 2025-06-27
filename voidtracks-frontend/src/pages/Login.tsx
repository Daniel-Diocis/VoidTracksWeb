/**
 * Login.tsx
 *
 * Pagina di autenticazione dell’utente tramite username e password.
 *
 * Funzionalità:
 * - Invia una richiesta POST a `/auth/login` per ottenere il token JWT
 * - Salva il token in `localStorage` per uso persistente
 * - Effettua una seconda richiesta a `/auth/private` per ottenere i dati completi dell’utente (es. numero di token, ruolo, notifiche)
 * - Mostra notifiche toast personalizzate per ogni notifica utente non letta
 * - Segna le notifiche come lette una volta che sono state chiuse tutte
 * - Salva le informazioni nel contesto `AuthContext` per uso globale nell’app
 * - Reindirizza l’utente alla homepage dopo il login
 *
 * Stato interno:
 * - `username`: valore del campo input utente
 * - `password`: valore del campo input password
 *
 * Dipendenze:
 * - `AuthContext` per gestire lo stato utente
 * - `toastManager` per le notifiche
 * - `react-router-dom` per la navigazione
 *
 * UI:
 * - Form responsive con validazione minima
 * - Mostra errori o conferme tramite toast
 */

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { notify, notifyWithOptions } from '../utils/toastManager';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const auth = useContext(AuthContext);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        notify.error(data.error || 'Errore di login');
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);

      // Chiamata per ottenere i dati utente, compresi i tokens numerici
      const userRes = await fetch(`${API_URL}/auth/private`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!userRes.ok) {
        notify.warning('Errore nel recupero dei dati utente');
        return;
      }

      const userData = await userRes.json();

      // Dopo questa riga, appena ricevuti i dati userData:
      console.log('Dati ricevuti da /auth/private:', userData);

      // Mostra le notifiche non lette
      const notifications = userData.notifications || [];

      if (notifications.length > 0) {
        let remaining = notifications.length;

        notifications.forEach((n: { message: string }) => {
          notifyWithOptions.success(n.message, {
            onClose: () => {
              remaining -= 1;
              if (remaining === 0) {
                // Dopo che l'utente le ha viste/chiuse tutte
                fetch(`${API_URL}/auth/notifications/mark-as-seen`, {
                  method: "PATCH",
                  headers: {
                    Authorization: `Bearer ${data.token}`,
                  },
                }).catch((err) => console.error("Errore PATCH notifiche:", err));
              }
            },
          });
        });
      }

      // Continua con login nel contesto
      auth?.login(
        {
          username: userData.user.username,
          role: userData.user.role
        },
        data.token,
        userData.user.tokens
      );
      notify.success('Accesso effettuato con successo');
      // Redirect o azione post login
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        notify.error(err.message);
      } else {
        notify.error('Errore di rete o server');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800 p-6 rounded-md shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl mb-4 text-center font-bold">Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-zinc-700 text-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded bg-zinc-700 text-white"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
        >
          Accedi
        </button>
      </form>
    </div>
  );
}

export default Login;