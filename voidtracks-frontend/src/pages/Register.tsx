import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const auth = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Errore durante la registrazione');
        return;
      }

      const data = await res.json();

      // Chiamata per ottenere dati utente compresi i token
      const userRes = await fetch(`${API_URL}/auth/private`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!userRes.ok) {
        setError('Registrazione completata, ma errore nel recupero dati utente');
        return;
      }

      const userData = await userRes.json();

      auth?.login(
        { username: userData.user.username, role: userData.user.role },
        data.token,
        userData.user.tokens
      );

      // Vai alla home
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Errore di rete o server');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800 p-6 rounded-md shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl mb-4 text-center font-bold">Registrati</h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}
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
          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-semibold"
        >
          Registrati
        </button>
      </form>
    </div>
  );
}

export default Register;