import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

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
      <div className="flex items-center gap-2 font-bold text-2xl">
        <Link to="/" className="hover:underline">
          VoidTracks
        </Link>
        {isLoggedIn && tokens !== undefined && (
          <span className="ml-4 text-sm font-normal text-cyan-400">
            Tokens: {tokens}
          </span>
        )}
      </div>
      <div className="flex gap-4 items-center">
        {/* Link visibili a tutti */}
        <Link to="/market" className="px-4 py-2 hover:underline">Market</Link>
        <Link to="/popular" className="px-4 py-2 hover:underline">Brani più popolari</Link>

        {/* Link solo utenti loggati */}
        {isLoggedIn && (
          <>
            <Link to="/my-purchases" className="px-4 py-2 hover:underline">I miei acquisti</Link>
            <Link to="/playlists" className="px-4 py-2 hover:underline">Le mie playlist</Link>
          </>
        )}

        {/* Link solo admin */}
        {isLoggedIn && user?.role === 'admin' && (
          <Link to="/admin" className="px-4 py-2 hover:underline">Pannello Admin</Link>
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