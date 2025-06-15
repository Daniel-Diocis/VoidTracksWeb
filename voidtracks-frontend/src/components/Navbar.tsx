import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
//import icon from '../assets/iconEmoji.png';

function Navbar() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) return null;

  const { isLoggedIn, logout } = auth;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-zinc-900 text-white max-w-7xl mx-auto">
      <div className="flex items-center gap-2 font-bold text-2xl">
        VoidTracks
      </div>
      <div className="flex gap-4">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
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