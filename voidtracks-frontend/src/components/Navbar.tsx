/**
 * Componente di navigazione principale dell'applicazione.
 *
 * Mostra:
 * - Link pubblici (Market, Brani più acquistati)
 * - Link condizionali per utenti loggati (Acquisti, Playlist, Richieste)
 * - Link specifici per admin (Ricarica, Richieste)
 * - Benvenuto con username e token
 * - Pulsanti Login/Logout
 *
 * Logica:
 * - Recupera stato di autenticazione da AuthContext
 * - Al logout reindirizza alla home
 */


import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import icon from '../assets/icon.png';

/**
 * Componente Navbar visibile in tutte le pagine.
 * Mostra link dinamici in base al ruolo dell'utente e allo stato di login.
 */
function Navbar() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) return null;

  const { isLoggedIn, logout, user, tokens } = auth;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-zinc-900 text-white max-w-7xl mx-auto">
      <div className="flex items-center gap-2 font-bold text-2xl flex-shrink-0 min-w-0">
        <Link to="/" className="flex items-center gap-2 hover:underline">
          <img src={icon} alt="Icon" className="w-8 h-8 object-contain" />
          VoidTracks
        </Link>
        {isLoggedIn && tokens !== undefined && (
          <span className="ml-4 text-sm font-normal text-cyan-400">
            Tokens: {tokens}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-4 items-center justify-end">
        {/* Link visibili a tutti */}
        <Link to="/market" className="px-4 py-2 hover:underline">Market</Link>
        <Link to="/popular" className="px-4 py-2 hover:underline">Brani più acquistati</Link>

        {/* Link solo utenti loggati */}
        {isLoggedIn && (
          <>
            <Link to="/my-purchases" className="px-4 py-2 hover:underline">I miei acquisti</Link>
            <Link to="/playlists" className="px-4 py-2 hover:underline">Le mie playlist</Link>
          </>
        )}
        {/* Link solo utenti loggati */}
        {isLoggedIn && user?.role === 'user' && (
          <>
            <Link to="/requests" className="px-4 py-2 hover:underline">Richieste</Link>
          </>
        )}
    
        {/* Link solo admin */}
        {isLoggedIn && user?.role === 'admin' && (
          <>
            <Link to="/admin" className="px-4 py-2 hover:underline">Ricarica</Link>
            <Link to="/admin/requests" className="px-4 py-2 hover:underline">Richieste</Link>
          </>
        )}

        {/* Login / Logout */}
        {isLoggedIn ? (
          <>
            <span className="self-center text-sm">Benvenuto, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
              Login
            </Link>
            <Link to="/register" className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
              Registrati
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;