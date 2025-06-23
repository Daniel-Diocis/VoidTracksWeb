import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PlaylistList from '../components/PlaylistList';
import PlaylistDetail from '../components/PlaylistDetail';
import type { Playlist } from '../types';

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
      const newPlaylist = await res.json();
      setPlaylists(prev => [newPlaylist, ...prev]);
      setNewName('');
      setSelected(newPlaylist.id);
    } catch (err) {
      console.error('Errore creazione playlist:', err);
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    if (!token) return;
    if (!window.confirm('Sei sicuro di voler eliminare questa playlist?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/playlists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(prev => prev.filter(p => p.id !== id));
      if (selected === id) setSelected(null);
    } catch (err) {
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
      setPlaylists(prev =>
        prev.map(p => (p.id === id ? { ...p, nome: data.playlist.nome } : p))
      );
    } catch (err) {
      console.error('Errore rinomina playlist:', err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-4 gap-4">
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