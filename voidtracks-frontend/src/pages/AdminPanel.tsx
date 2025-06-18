import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function AdminPanel() {
  const [username, setUsername] = useState('');
  const [tokens, setTokens] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const auth = useContext(AuthContext);
  const token = auth?.token; // preso dal contesto
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/admin/recharge`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, tokens }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Errore durante la ricarica');
        return;
      }

      setMessage(data.message);
    } catch (err) {
      console.error('Errore durante la ricarica:', err);
      setError('Errore di rete o server');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
      <form
        onSubmit={handleRecharge}
        className="bg-zinc-800 p-6 rounded-md shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl mb-4 text-center font-bold">Pannello Admin</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-green-500 mb-4">{message}</p>}

        <input
          type="text"
          placeholder="Username utente"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-zinc-700 text-white"
          required
        />

        <input
          type="number"
          placeholder="Token da assegnare"
          value={tokens}
          onChange={e => setTokens(Number(e.target.value))}
          className="w-full mb-4 px-3 py-2 rounded bg-zinc-700 text-white"
          min={0}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
        >
          Ricarica
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;