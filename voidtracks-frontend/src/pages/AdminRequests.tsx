import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { notify } from '../utils/toastManager';

type RequestItem = {
  id: number;
  brano: string;
  artista: string;
  tokens: number;
  createdAt: string;
  updatedAt: string;
  user: string;
  voti: number;
};

function AdminRequests() {
  const auth = useContext(AuthContext);
  const token = auth?.token;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokensToAdd, setTokensToAdd] = useState<Record<number, number>>({});

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error || 'Errore nel recupero richieste');
        return;
      }

      setRequests(
        data.sort((a: RequestItem, b: RequestItem) => b.voti - a.voti)
      );
    } catch (err) {
      console.error('Errore fetch richieste:', err);
      notify.error('Errore di rete');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const body = action === 'approve'
      ? JSON.stringify({ tokensToAdd: tokensToAdd[id] ?? 0 })
      : null;

    try {
      const res = await fetch(`${API_URL}/admin/requests/${id}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        notify.error(data.error || 'Errore durante l’operazione');
        return;
      }

      notify.success(data.message || 'Operazione completata');
      setRequests(prev => prev.filter(r => r.id !== id));
      setTokensToAdd(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      console.error(`Errore ${action} richiesta:`, err);
      notify.error('Errore di rete');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Richieste in Attesa</h2>

      {loading ? (
        <p className="text-center">Caricamento...</p>
      ) : requests.length === 0 ? (
        <p className="text-center">Nessuna richiesta pendente</p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {requests.map(req => (
            <div
              key={req.id}
              className="bg-zinc-800 p-4 rounded shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <p className="font-semibold text-lg">{req.brano} – {req.artista}</p>
                <p className="text-sm text-zinc-400">
                  Da: <span className="text-white">{req.user}</span> – Voti: {req.voti}
                </p>
                <p className="text-xs text-zinc-500">
                  Inviata il {new Date(req.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <label className="text-sm mr-2">Token da assegnare:</label>
                  <input
                    type="number"
                    min={0}
                    value={tokensToAdd[req.id] ?? 0}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parsed = parseInt(val, 10);
                      setTokensToAdd(prev => ({
                        ...prev,
                        [req.id]: isNaN(parsed) ? 0 : parsed,
                      }));
                    }}
                    className="w-20 px-2 py-1 rounded bg-zinc-700 text-white border border-zinc-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleAction(req.id, 'approve')}
                  disabled={(tokensToAdd[req.id] ?? 0) < 0}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approva
                </button>
                <button
                  onClick={() => handleAction(req.id, 'reject')}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium"
                >
                  Rifiuta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminRequests;