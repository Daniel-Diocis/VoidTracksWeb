import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import PlaylistList from '../components/PlaylistList';
import PlaylistDetail from '../components/PlaylistDetail';
import type { Playlist } from '../types';

export default function PlaylistsPage() {
  const { token } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchPlaylists = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Errore durante il recupero delle playlist');
        }

        const data = await response.json();
        setPlaylists(data);
      } catch (err) {
        console.error('Errore caricamento playlist:', err);
      }
    };

    fetchPlaylists();
  }, [token]);

  const handleCreatePlaylist = async () => {
    if (!token || !newName.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nome: newName })
      });

      if (!response.ok) throw new Error('Errore creazione playlist');

      const newPlaylist = await response.json();
      setPlaylists(prev => [newPlaylist, ...prev]);
      setNewName('');
      setSelected(newPlaylist.id); // Se vuoi selezionarla subito
    } catch (err) {
      console.error('Errore creazione playlist:', err);
    }
  };

    const handleDeletePlaylist = async (id: number) => {
    if (!token) return;

    const confirm = window.confirm('Sei sicuro di voler eliminare questa playlist?');
    if (!confirm) return;

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
        });

        if (!response.ok) throw new Error('Errore eliminazione playlist');

        setPlaylists(prev => prev.filter(p => p.id !== id));
        if (selected === id) setSelected(null);
    } catch (err) {
        console.error('Errore durante l\'eliminazione della playlist:', err);
    }
    };

    const handleRenamePlaylist = async (id: number, nuovoNome: string) => {
    if (!token || !nuovoNome.trim()) return;

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nome: nuovoNome.trim() })
        });

        if (!response.ok) throw new Error('Errore nella modifica della playlist');

        const data = await response.json();

        // Aggiorna la playlist rinominata nella lista
        const updated = data.playlist.nome;
        setPlaylists(prev =>
        prev.map(p => (p.id === id ? { ...p, nome: updated } : p))
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
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nome playlist"
              className="border rounded px-2 py-1 w-full"
            />
            <button
              onClick={handleCreatePlaylist}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Crea
            </button>
          </div>
        </div>

        <PlaylistList
          playlists={playlists}
          onSelect={setSelected}
          selectedId={selected}
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