/**
 * PlaylistPage.tsx
 *
 * Pagina principale per la gestione delle playlist utente.
 *
 * Funzionalità:
 * - Visualizza l’elenco delle playlist create dall’utente
 * - Permette di creare, rinominare ed eliminare playlist
 * - Mostra i dettagli della playlist selezionata tramite il componente `PlaylistDetail`
 *
 * Meccanismo:
 * - Recupera le playlist dal backend autenticato tramite token JWT
 * - Gestisce le operazioni CRUD tramite fetch verso le API REST
 * - Aggiorna lo stato locale delle playlist in seguito a ogni azione dell’utente
 *
 * Composizione:
 * - Usa i componenti `PlaylistList` e `PlaylistDetail`
 * - Gestisce il token e il logout automatico in caso di errore 401
 *
 * UI:
 * - Layout responsive (colonna singola su mobile, affiancato su desktop)
 * - Form semplice per creare nuove playlist
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PlaylistList from '../components/PlaylistList';
import PlaylistDetail from '../components/PlaylistDetail';
import type { Playlist } from '../types';
import { notify } from '../utils/toastManager';

export default function PlaylistsPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/playlists`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        const data = await res.json();

        if (!res.ok) {
          notify.error(data?.error || 'Errore nel caricamento delle playlist');
          console.error("Errore backend:", data?.error || "Errore generico");
        if (res.status === 401) {
          logout(); // funzione del tuo hook useAuth
          navigate("/login");
        }
          return;
        }

        if (Array.isArray(data)) {
          setPlaylists(data);
        } else {
          console.warn("Formato playlist inatteso:", data);
          setPlaylists([]); // fallback sicuro
        }
      })
      .catch(err => {
        console.error("Errore caricamento playlist:", err);
        notify.error('Errore di rete nel caricamento delle playlist');
      });
  }, [token]);

  const handleCreatePlaylist = async () => {
    if (!token || !newName.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: newName }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        notify.error(data.error || 'Errore nella creazione della playlist');
        console.error('Errore creazione playlist:', data.error || data);
        return;
      }

      setPlaylists(prev => [data, ...prev]);
      setNewName('');
      setSelected(data.id);
      notify.success('Playlist creata!');
    } catch (err) {
      notify.error('Errore di rete o del server');
      console.error('Errore creazione playlist:', err);
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    if (!token) return;
    if (!confirm('Sei sicuro di voler eliminare questa playlist?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        notify.error(data.error || 'Errore durante l’eliminazione della playlist');
        console.error('Errore eliminazione playlist:', data.error || data);
        return;
      }

      setPlaylists(prev => prev.filter(p => p.id !== id));
      if (selected === id) setSelected(null);
      notify.success('Playlist eliminata');
    } catch (err) {
      notify.error('Errore di rete o del server');
      console.error('Errore eliminazione playlist:', err);
    }
  };

  const handleRenamePlaylist = async (id: number, nuovoNome: string) => {
    if (!token || !nuovoNome.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: nuovoNome.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        notify.error(data.error || 'Errore durante la rinomina');
        console.error('Errore rinomina playlist:', data.error || data);
        return;
      }

      setPlaylists(prev =>
        prev.map(p => (p.id === id ? { ...p, nome: data.playlist.nome } : p))
      );
      notify.success('Playlist rinominata');
    } catch (err) {
      notify.error('Errore di rete o del server');
      console.error('Errore rinomina playlist:', err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-4 gap-4 mx-auto pb-32">
      <div className="w-full md:w-1/3">
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Crea nuova Playlist</h3>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nome playlist"
              className="w-full"
            />
            <button onClick={handleCreatePlaylist} className="market-buy">
              Crea
            </button>
          </div>
        </div>
        <PlaylistList
          playlists={playlists}
          selectedId={selected}
          onSelect={setSelected}
          onDelete={handleDeletePlaylist}
        />
      </div>
      {selected && (
        <PlaylistDetail
          playlistId={selected}
          onRename={handleRenamePlaylist}
        />
      )}
    </div>
  );
}