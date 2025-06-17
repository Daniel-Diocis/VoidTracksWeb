import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { PlaylistWithTracks } from '../types';

export default function PlaylistDetail({ 
    playlistId, 
    onRename 
    }: { 
        playlistId: number; 
        onRename: (id: number, nuovoNome: string) => void; 
    }) {
  const { token } = useAuth();
  const [playlist, setPlaylist] = useState<PlaylistWithTracks | null>(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Errore fetch dettagli playlist');
        return res.json();
      })
      .then(data => {
        setPlaylist(data);
        setNewName(data.playlist.nome);
      })
      .catch(err => console.error('Errore dettagli playlist', err));
  }, [token, playlistId]);

    const handleRename = async () => {
    if (!newName.trim()) return;
    await onRename(playlistId, newName.trim());
    setEditing(false);
    };

  if (!playlist) return <div className="w-full md:w-2/3">Caricamento...</div>;

  return (
    <div className="w-full md:w-2/3 border p-4 rounded-xl bg-white shadow-md">
      <div className="flex items-center justify-between mb-2">
        {editing ? (
          <div className="flex gap-2 w-full">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1 p-1 border rounded"
            />
            <button onClick={handleRename} className="text-green-600 font-semibold">✔</button>
            <button onClick={() => setEditing(false)} className="text-gray-500">✖</button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">{playlist.playlist.nome}</h2>
            <button onClick={() => setEditing(true)} className="text-blue-500 text-sm">✏️ Rinomina</button>
          </>
        )}
      </div>

      <ul>
        {playlist.tracks.map(track => (
          <li key={track.id} className="flex items-center justify-between p-2 border-b">
            <div>
              <div className="font-medium">{track.titolo}</div>
              <div className="text-sm text-gray-500">{track.artista} – {track.album}</div>
            </div>
            {track.is_favorite && <span className="text-yellow-500 font-bold">★</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}