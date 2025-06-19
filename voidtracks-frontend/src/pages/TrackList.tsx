import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadLocalTimestamps, saveLocalTimestamps } from '../utils/storage';

type TrackBase = {
  id: string;
  titolo: string;
  artista: string;
  album: string;
  music_path: string;
  cover_path: string;
  updated_at: string;
};

type Track = TrackBase & {
  isUpdated?: boolean;
};

const PUBLIC_URL = 'https://igohvppfcsipbmzpckei.supabase.co/storage/v1/object/public';

function TrackList() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const url = query ? `${API_URL}/tracks?q=${encodeURIComponent(query)}` : `${API_URL}/tracks`;
    fetch(url)
      .then(res => res.json())
      .then((data: TrackBase[]) => {
        const ordinati = [...data].sort((a, b) => {
        const artistaA = a.artista.split(',')[0].trim().toLowerCase();
        const artistaB = b.artista.split(',')[0].trim().toLowerCase();
        const confrontoArtista = artistaA.localeCompare(artistaB);
        if (confrontoArtista !== 0) return confrontoArtista;
        return a.titolo.toLowerCase().localeCompare(b.titolo.toLowerCase());
        });

        const localTimestamps = loadLocalTimestamps();
        const newTimestamps: Record<string, string> = {};

        const aggiornati = ordinati.map(track => {
          const id = track.music_path;
          const updatedAt = track.updated_at;
          const localUpdated = localTimestamps[id];

          const shouldUpdate = !localUpdated || localUpdated !== updatedAt;
          if (shouldUpdate) {
            newTimestamps[id] = updatedAt;
          }

          // estendo con isUpdated solo in frontend
          return { ...track, isUpdated: shouldUpdate };
        });

        saveLocalTimestamps({ ...localTimestamps, ...newTimestamps });

        setTracks(aggiornati);
      })
      .catch(err => console.error('Errore nel fetch:', err));
  }, [query]);

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-4 py-6 max-w-7xl mx-auto">
      {/* Input di ricerca */}
      <input
        type="text"
        placeholder="Cerca titolo, artista o album..."
        value={query}
        onChange={e => setQuery(e.target.value)} // aggiorna query e fa partire fetch
        className="w-full mb-6 p-2 rounded bg-zinc-700 text-white placeholder-zinc-400"
      />
      {/* Player del brano in riproduzione */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-800 p-4 flex items-center gap-4">
          <img
            src={`${PUBLIC_URL}/cover/${currentTrack.cover_path}`}
            alt={`Cover ${currentTrack.titolo}`}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex flex-col">
            <span className="font-bold">{currentTrack.titolo}</span>
            <span className="text-sm text-gray-400">{currentTrack.artista}</span>
          </div>
          <audio
            controls
            controlsList="nodownload"
            autoPlay
            src={`${PUBLIC_URL}/music/${currentTrack.music_path}`}
            className="flex-grow"
            onEnded={() => setCurrentTrack(null)}
          />
          <button onClick={() => setCurrentTrack(null)} className="ml-4 text-white">
            Close
          </button>
        </div>
      )}
      {/* Lista tracce */}
      {tracks.length === 0 ? (
        <p className="text-center">Caricamento...</p>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
        >
          {tracks.map(track => (
            <div
              key={track.id}
              className="track-card"
            >
              <Link to={`/track/${track.music_path}`}>
                <img
                  src={`${PUBLIC_URL}/cover/${track.cover_path}`}
                  alt={`Cover ${track.titolo}`}
                  className="track-cover"
                />
              </Link>
              <div className="track-text">
                <p className="track-title">{track.titolo}</p>
                <p className="track-artist">{track.artista}</p>
                <p className="track-album">{track.album}</p>
              </div>
              <button
                onClick={() => setCurrentTrack(track)}
                className="btn-play"
              >
                {currentTrack?.id === track.id ? 'Pause' : 'Play'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackList;