import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { PlaylistWithTracks } from '../types';
import type { PurchaseWithTrack } from '../types'; // o il percorso corretto
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
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [purchasedTracks, setPurchasedTracks] = useState<PurchaseWithTrack[]>([]);

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

            if (!playlistRes.ok || !purchasesRes.ok) {
            throw new Error('Errore nel fetch');
            }

            const playlistData = await playlistRes.json();
            const purchasesData = await purchasesRes.json();

            // 🔒 Controllo difensivo: se manca tracks, assegna array vuoto
            if (!Array.isArray(playlistData.tracks)) {
            console.warn('La playlist non contiene tracks, assegno array vuoto');
            playlistData.tracks = [];
            }

            setPlaylist(playlistData);
            setNewName(playlistData.playlist.nome);
            setPurchasedTracks(purchasesData.data || []); // fallback vuoto se manca "data"
        } catch (err) {
            console.error('Errore dettagli playlist', err);
        }
    };

    fetchData();
    }, [token, playlistId]);

    const handleRename = async () => {
    if (!newName.trim()) return;
    await onRename(playlistId, newName.trim());
    setEditing(false);
    };

    const handleAddSpecificTrack = async (trackId: string) => {
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}/tracks`, {
        track_id: trackId
        }, {
        headers: { Authorization: `Bearer ${token}` }
        });

        alert("Brano aggiunto con successo.");

        // Ricarica playlist aggiornata
        const updated = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        const data = await updated.json();
        if (!Array.isArray(data.tracks)) {
        data.tracks = [];
        }
        setPlaylist(data);
    } catch (err) {
        console.error("Errore aggiunta brano:", err);
        alert("Errore durante l'aggiunta del brano.");
    }
    };

    const handleRemoveTrack = async (trackId: string) => {
    const confirm = window.confirm("Sei sicuro di voler rimuovere questo brano?");
    if (!confirm) return;

    try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` }
        });

        // Ricarica la playlist aggiornata
        const updated = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        const data = await updated.json();
        setPlaylist(data);
    } catch (err) {
        console.error("Errore rimozione brano:", err);
        alert("Errore durante la rimozione del brano.");
    }
    };

    const handleSetFavorite = async (trackId: string) => {
    try {
        await axios.patch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}/favorite`, {
        trackId
        }, {
        headers: { Authorization: `Bearer ${token}` }
        });

        // Ricarica la playlist aggiornata
        const updated = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        const data = await updated.json();
        setPlaylist(data);
    } catch (err) {
        console.error("Errore impostazione preferito:", err);
        alert("Errore durante l'aggiornamento del brano preferito.");
    }
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
        <h3 className="font-semibold mt-6 mb-2">Brani acquistati non presenti nella playlist:</h3>
        <ul className="border rounded p-2 bg-gray-50">
        {purchasedTracks
            .filter(p => p.Track && !playlist.tracks.some(t => t.id === p.Track.id))
            .map(p => (
                <li key={p.Track!.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                    <div className="font-medium">{p.Track!.titolo}</div>
                    <div className="text-sm text-gray-500">{p.Track!.artista} – {p.Track!.album}</div>
                </div>
                <button
                    onClick={() => handleAddSpecificTrack(p.Track!.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                    ➕ Aggiungi
                </button>
            </li>
        ))}

        {/* fallback se nessun brano da aggiungere */}
        {purchasedTracks.filter(p => p.Track && !playlist.tracks.some(t => t.id === p.Track.id)).length === 0 && (
        <li className="text-gray-500 italic p-2">Tutti i brani acquistati sono già presenti nella playlist.</li>
        )}
        </ul>
        <ul>
            {playlist.tracks && playlist.tracks.length > 0 ? (
            playlist.tracks.map(track => (
                <li key={track.id} className="flex items-center justify-between p-2 border-b">
                <div>
                    <div className="font-medium">{track.titolo}</div>
                    <div className="text-sm text-gray-500">{track.artista} – {track.album}</div>
                </div>
                <div className="flex gap-2 items-center">
                    {track.is_favorite && <span className="text-yellow-500 font-bold">★</span>}
                    <button 
                    onClick={() => handleSetFavorite(track.id)} 
                    title="Imposta come preferito"
                    className="text-yellow-500 hover:text-yellow-600"
                    >
                    ⭐
                    </button>
                    <button 
                    onClick={() => handleRemoveTrack(track.id)} 
                    title="Rimuovi brano"
                    className="text-red-500 hover:text-red-700"
                    >
                    🗑️
                    </button>
                </div>
                </li>
            ))
            ) : (
            <li className="text-gray-500 italic p-2">Nessun brano presente in questa playlist.</li>
            )}
        </ul>
    </div>
  );
}