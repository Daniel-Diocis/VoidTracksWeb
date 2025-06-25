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

      setRequests(data);
    } catch (err) {
      console.error('Errore fetch richieste:', err);
      notify.error('Errore di rete');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`${API_URL}/admin/requests/${id}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        notify.error(data.error || 'Errore durante l’operazione');
        return;
      }

      notify.success(data.message || 'Operazione completata');
      setRequests(prev => prev.filter(r => r.id !== id));
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
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleAction(req.id, 'approve')}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium"
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