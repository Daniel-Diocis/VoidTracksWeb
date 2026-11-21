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
 * - Imposta la coda del player quando viene selezionato un brano
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
import { usePlayer } from '../context/playerState';
import type { Track } from '../types';

import TrackCoverButton from '../components/TrackCoverButton';

function TrackList() {
  const { currentTrack, isPlaying, toggleTrack } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const url = query
      ? `${API_URL}/tracks?q=${encodeURIComponent(query)}`
      : `${API_URL}/tracks`;

    fetch(url)
      .then(res => res.json())
      .then((data: Track[]) => {
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

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-4 py-6 max-w-7xl mx-auto">
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
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}
        >
          {tracks.map(track => (
            <div key={track.id} className="track-card">
              <TrackCoverButton track={track} playing={currentTrack?.id === track.id && isPlaying}
                onToggle={() => toggleTrack(track, tracks)} />
              <div className="track-text">
                <p className="track-title">
                  <Link className="hover:underline" to={`/track/${encodeURIComponent(track.music_path)}`}>{track.titolo}</Link>
                </p>
                <p className="track-artist" title={track.artista}>
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
                <p className="track-album">
                  <Link
                    to={`/album/${encodeURIComponent(track.album)}`}
                    className="text-blue-400 hover:underline"
                  >
                    {track.album}
                  </Link>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackList;
