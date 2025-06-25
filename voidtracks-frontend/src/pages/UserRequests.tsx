import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { notify } from "../utils/toastManager";

interface RequestItem {
  id: number;
  brano: string;
  artista: string;
  status: string;
  tokens: number;
  createdAt: string;
  updatedAt: string;
  voti: number;
  hasVoted: boolean;
}

export default function UserRequests() {
  const { token, logout, setTokens } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [brano, setBrano] = useState("");
  const [artista, setArtista] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

    if (!res.ok) {
      notify.error(data.error || "Errore nel caricamento richieste");
      if (res.status === 401) logout(); // utile anche qui
      return;
    }

      setRequests(data);
    } catch (err) {
      console.error("Errore rete richieste:", err);
      notify.error("Errore di rete");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brano.trim() || !artista.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ brano, artista }),
      });

      const data = await res.json();

      if (!res.ok) {
        notify.error(data.error || "Errore durante la richiesta");
        if (res.status === 401) logout();
        return;
      }

      notify.success("Richiesta inviata!");
      setBrano("");
      setArtista("");

      // Aggiorna i token dopo la richiesta
      const userRes = await fetch(`${API_URL}/auth/private`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (typeof userData.user.tokens === 'number') {
          setTokens(userData.user.tokens);
        }
      }

      fetchRequests();
    } catch (err) {
      console.error("Errore creazione richiesta:", err);
      notify.error("Errore di rete");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/requests/${id}/vote`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        notify.error(data.error || "Errore nel voto");
        if (res.status === 401) logout();
        return;
      }

      fetchRequests();
    } catch (err) {
      console.error("Errore voto:", err);
      notify.error("Errore di rete");
    }
  };

  const handleUnvote = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/requests/${id}/vote`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        notify.error(data.error || "Errore nella rimozione del voto");
        return;
      }

      fetchRequests();
    } catch (err) {
      console.error("Errore unvote:", err);
      notify.error("Errore di rete");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Richieste Utente</h1>

      <form onSubmit={handleCreate} className="mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Brano"
            value={brano}
            onChange={(e) => setBrano(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
          <input
            type="text"
            placeholder="Artista"
            value={artista}
            onChange={(e) => setArtista(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Invio..." : "Invia"}
        </button>
      </form>

      <ul>
        {requests.map((r) => (
          <li key={r.id} className="border rounded p-4 mb-3">
            <p className="font-semibold">{r.brano} - {r.artista}</p>
            <p className="text-sm text-gray-500">
              {r.voti} vot{r.voti === 1 ? "o" : "i"} – {r.status}
            </p>
            {token && (
              <div className="mt-2">
                {r.hasVoted ? (
                  <button
                    onClick={() => handleUnvote(r.id)}
                    className="text-red-600 text-sm underline"
                  >
                    Rimuovi voto
                  </button>
                ) : (
                  <button
                    onClick={() => handleVote(r.id)}
                    className="text-blue-600 text-sm underline"
                  >
                    Vota
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}