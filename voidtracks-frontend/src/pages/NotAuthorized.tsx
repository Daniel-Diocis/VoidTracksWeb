/**
 * NotAuthorized.tsx
 *
 * Pagina visualizzata quando un utente tenta di accedere a una risorsa per cui non ha i permessi.
 *
 * Funzionalità:
 * - Mostra un messaggio di errore chiaro e centrato nella pagina
 * - Fornisce un link per tornare alla homepage
 *
 * Utilizzo:
 * - Generalmente collegata a percorsi protetti da middleware di controllo ruolo o autenticazione
 *
 * UI:
 * - Layout centrato con messaggi esplicativi e uno stile coerente con il resto dell’app
 */

import { Link } from 'react-router-dom';

function NotAuthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Accesso Negato</h1>
      <p className="mb-6">Non hai i permessi necessari per accedere a questa pagina.</p>
      <Link to="/" className="text-cyan-600 underline">
        Torna alla Home
      </Link>
    </div>
  );
}

export default NotAuthorized;