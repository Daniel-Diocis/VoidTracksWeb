import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { PlaylistWithTracks, PurchaseWithTrack } from '../types';
import axios from 'axios';

export default function PlaylistDetail({
  playlistId,
  onRename
}: {
  playlistId: number;
  onRename: (id: number, nuovoNome: string) => void;
}) {
  const { token } = useAuth();
  const [playlist, setPlaylist] = useState<PlaylistWithTracks | null>(null);
  const [purchasedTracks, setPurchasedTracks] = useState<PurchaseWithTrack[]>([]);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [playlistRes, purchasesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL}/purchases`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const playlistData = await playlistRes.json();
        const purchasesData = await purchasesRes.json();

        playlistData.tracks ??= [];
        setPlaylist(playlistData);
        setNewName(playlistData.playlist.nome);
        setPurchasedTracks(purchasesData.data || []);
      } catch (err) {
        console.error('Errore fetch playlist:', err);
      }
    };

    fetchData();
  }, [token, playlistId]);

  const handleRename = async () => {
    if (!newName.trim()) return;
    await onRename(playlistId, newName.trim());
    setEditing(false);
  };

  const refreshPlaylist = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    data.tracks ??= [];
    setPlaylist(data);
  };

  const handleAddTrack = async (trackId: string) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/playlists/${playlistId}/tracks`,
        { track_id: trackId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshPlaylist();
    } catch (err) {
      console.error("Errore aggiunta brano:", err);
      alert('Errore aggiunta brano');
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!window.confirm('Rimuovere questo brano?')) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/playlists/${playlistId}/tracks/${trackId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshPlaylist();
    } catch (err) {
      console.error("Errore aggiunta brano:", err);
      alert('Errore rimozione brano');
    }
  };

  const handleSetFavorite = async (trackId: string) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/playlists/${playlistId}/favorite`,
        { trackId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshPlaylist();
    } catch (err) {
      console.error("Errore impostazione preferito:", err);
      alert('Errore impostazione preferito');
    }
  };

  if (!playlist) return <div className="panel">Caricamento...</div>;

  return (
    <div className="panel w-full md:w-2/3">
      <div className="flex items-center justify-between mb-2">
        {editing ? (
          <div className="flex gap-2 w-full">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1"
            />
            <button onClick={handleRename} className="text-green-400">✔</button>
            <button onClick={() => setEditing(false)} className="text-gray-400">✖</button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">{playlist.playlist.nome}</h2>
            <button onClick={() => setEditing(true)} className="text-blue-400 text-sm">
              ✏️ Rinomina
            </button>
          </>
        )}
      </div>

      <h3 className="font-semibold mt-4 mb-2">Brani acquistati non nella playlist:</h3>
      <ul className="bg-zinc-800 p-2 rounded border border-zinc-700 mb-4">
        {purchasedTracks
          .filter(p => p.Track && !playlist.tracks.some(t => t.id === p.Track.id))
          .map(p => (
            <li
              key={p.Track!.id}
              className="flex justify-between items-center py-2 border-b border-zinc-700 last:border-b-0"
            >
              <div>
                <div className="font-medium">{p.Track!.titolo}</div>
                <div className="text-sm text-gray-400">{p.Track!.artista} – {p.Track!.album}</div>
              </div>
              <button onClick={() => handleAddTrack(p.Track!.id)} className="market-buy">
                ➕ Aggiungi
              </button>
            </li>
          ))}
        {purchasedTracks.filter(p => p.Track && !playlist.tracks.some(t => t.id === p.Track.id)).length === 0 && (
          <li className="text-gray-500 italic p-2">Nessun brano disponibile da aggiungere.</li>
        )}
      </ul>

      <h3 className="font-semibold mb-2">Brani nella playlist:</h3>
      <ul>
        {playlist.tracks.length > 0 ? (
          playlist.tracks.map(track => (
            <li key={track.id} className="flex justify-between items-center p-2 border-b border-zinc-700">
              <div>
                <div className="font-medium">{track.titolo}</div>
                <div className="text-sm text-gray-400">{track.artista} – {track.album}</div>
              </div>
              <div className="flex items-center gap-2">
                {track.is_favorite && <span className="text-yellow-400 font-bold">★</span>}
                <button
                  onClick={() => handleSetFavorite(track.id)}
                  title="Imposta come preferito"
                  className="text-yellow-400 hover:text-yellow-500"
                >
                  ⭐
                </button>
                <button
                  onClick={() => handleRemoveTrack(track.id)}
                  title="Rimuovi"
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-500 italic p-2">Nessun brano nella playlist.</li>
        )}
      </ul>
    </div>
  );
}