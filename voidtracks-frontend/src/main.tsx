/**
 * Entry point dell'applicazione VoidTracks.
 * Monta l'app React all'interno del DOM, avvolgendola nei provider
 * necessari per routing, autenticazione, gestione del player globale
 * e notifiche.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext'; // 👈 importa il tuo contesto
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

/**
 * Monta l'applicazione nel nodo con id 'root'.
 * - StrictMode: aiuta a identificare potenziali problemi in fase di sviluppo.
 * - BrowserRouter: gestisce il routing lato client.
 * - AuthProvider: fornisce il contesto di autenticazione globale.
 * - PlayerProvider: gestisce il contesto del player musicale.
 * - ToastContainer: gestisce le notifiche globali.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            pauseOnHover
          />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);