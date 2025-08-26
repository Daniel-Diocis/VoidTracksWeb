/**
 * Componente che mostra la lista completa dei brani musicali disponibili.
 *
 * Funzionalità:
 * - Recupera tutti i brani dal backend (con ricerca facoltativa)
 * - Ordina i brani per artista e titolo
 * - Evidenzia se un brano è stato aggiornato rispetto alla versione salvata localmente
 * - Permette di riprodurre o mettere in pausa una traccia tramite il player globale (usePlayer)
 *
 * Meccanismo:
 * - Effettua fetch a `/tracks` con eventuale query `?q=`
 * - Confronta i `updated_at` dei brani con i timestamp salvati localmente (localStorage)
 * - Aggiorna la lista dei brani tramite `setTracks` fornito dal contesto `PlayerContext`
 *
 * UI:
 * - Input per la ricerca per titolo, artista o album
 * - Griglia responsiva di schede per ciascun brano (cover, titolo, artista, album)
 * - Pulsante play/pause personalizzato con stato gestito globalmente
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadLocalTimestamps, saveLocalTimestamps } from '../utils/storage';
import { notify } from '../utils/toastManager';
import { usePlayer } from '../context/PlayerContext';
import type { Track } from '../types';

//const PUBLIC_URL = import.meta.env.PUBLIC_URL;
const COVER_URL = import.meta.env.VITE_COVER_URL;

function TrackList() {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    //playNext,
    //playPrevious,
    tracks,
    setTracks,
  } = usePlayer();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const url = query
      ? `${API_URL}/tracks?q=${encodeURIComponent(query)}`
      : `${API_URL}/tracks`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
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

          return { ...track, isUpdated: shouldUpdate };
        });

        saveLocalTimestamps({ ...localTimestamps, ...newTimestamps });
        setTracks(aggiornati);
      })
      .catch(err => {
        console.error('Errore nel fetch:', err);
        notify.error('Errore nel caricamento dei brani');
      });
  }, [query]);

  const handlePlayPause = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-4 py-6 max-w-7xl mx-auto pb-32">
      <input
        type="text"
        placeholder="Cerca titolo, artista o album..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full mb-6 p-2 rounded bg-zinc-700 text-white placeholder-zinc-400"
      />

      {tracks.length === 0 && !query ? (
        <p className="text-center">Caricamento...</p>
      ) : tracks.length === 0 && query ? (
        <p className="text-center">Nessun brano trovato per “{query}”.</p>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
        >
          {tracks.map(track => (
            <div key={track.id} className="track-card">
              <Link to={`/track/${track.music_path}`}>
                <img
                  src={`${COVER_URL}/${track.cover_path}`}
                  alt={`Cover ${track.titolo}`}
                  className="track-cover"
                />
              </Link>
              <div className="track-text">
                <p className="track-title">{track.titolo}</p>
                <p className="track-artist">
                  {track.artista.split(',').map((artistName, index, arr) => {
                    const trimmedName = artistName.trim();
                    return (
                      <span key={trimmedName}>
                        <Link to={`/artist/${encodeURIComponent(trimmedName)}`} className="text-blue-400 hover:underline">
                          {trimmedName}
                        </Link>
                        {index < arr.length - 1 ? ', ' : ''}
                      </span>
                    );
                  })}
                </p>
                <p className="track-album">{track.album}</p>
              </div>
              <button
                onClick={() => handlePlayPause(track)}
                className="btn-play"
              >
                {currentTrack?.id === track.id && isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackList;