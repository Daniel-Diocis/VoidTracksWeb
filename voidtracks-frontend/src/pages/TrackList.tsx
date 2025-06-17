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
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/tracks`)
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
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-4 py-6 max-w-7xl mx-auto">
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
              <audio
                controls
                controlsList="nodownload"
                src={`${PUBLIC_URL}/music/${track.music_path}`}
                className="track-audio"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackList;