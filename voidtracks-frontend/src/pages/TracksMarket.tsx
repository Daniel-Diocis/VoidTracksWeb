/**
 * Componente che rappresenta il market dei brani acquistabili.
 *
 * Funzionalità principali:
 * - Recupera tutti i brani disponibili dal backend (con possibilità di ricerca)
 * - Ordina i brani per artista e titolo
 * - Evidenzia i brani aggiornati rispetto alla versione salvata localmente
 * - Recupera la lista degli acquisti effettuati dall’utente autenticato
 * - Permette l’acquisto di un brano con token e reindirizza alla pagina di download
 * - Mostra pulsanti diversi in base allo stato del brano (non acquistato, acquistato, scaricabile)
 * - Integra controlli di riproduzione tramite il player globale
 *
 * Meccanismo:
 * - Due useEffect: uno per il fetch dei brani, l’altro per gli acquisti
 * - Verifica timestamp aggiornamento brani tramite `loadLocalTimestamps` e `saveLocalTimestamps`
 * - Usa il contesto `AuthContext` per autenticazione e token, `PlayerContext` per la riproduzione
 * - Gestione acquisti con chiamata `POST /purchase` e aggiornamento download token
 *
 * UI:
 * - Input per ricerca
 * - Lista brani in formato card con copertina, titolo, artista, album, costo
 * - Pulsanti dinamici per Acquista / Download / Riproduci
 */

import { useEffect, useState, useContext } from 'react';
import { loadLocalTimestamps, saveLocalTimestamps } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { notify } from '../utils/toastManager';
import { usePlayer } from '../context/PlayerContext';
import type { Track } from '../types';

//const PUBLIC_URL = import.meta.env.PUBLIC_URL;
const COVER_URL = import.meta.env.VITE_COVER_URL;

const TracksMarket = () => {
  const [tracksFromDB, setTracksFromDB] = useState<Track[]>([]);
  const [query, setQuery] = useState('');
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [downloadMap, setDownloadMap] = useState<Record<string, string>>({});
  const auth = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const navigate = useNavigate();

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    //playNext,
    //playPrevious,
    //tracks,
    setTracks
  } = usePlayer();

  useEffect(() => {
    const url = query ? `${API_URL}/tracks?q=${encodeURIComponent(query)}` : `${API_URL}/tracks`;
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

          if (!id || !updatedAt) return track; // salta se mancano i dati essenziali

          const localUpdated = localTimestamps[id];
          const shouldUpdate = !localUpdated || localUpdated !== updatedAt;

          if (shouldUpdate) {
            newTimestamps[id] = updatedAt;
          }

          return { ...track, isUpdated: shouldUpdate };
        });

        saveLocalTimestamps({ ...localTimestamps, ...newTimestamps });
        setTracks(aggiornati);
        setTracksFromDB(aggiornati);
      })
      .catch(err => console.error('Errore nel fetch:', err));
  }, [query]);

  useEffect(() => {
    if (auth?.token) {
      fetch(`${API_URL}/purchase`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
        .then(async res => {
          if (!res.ok) throw new Error('Errore nel recupero degli acquisti');
          const json = await res.json();
          const purchases: { track_id: string; download_token: string; used_flag: boolean }[] = json.data;
          const ids = new Set(purchases.map(p => p.track_id));
          const tokensMap: Record<string, string> = {};
          purchases.forEach(p => {
            if (!p.used_flag) tokensMap[p.track_id] = p.download_token;
          });
          setPurchasedIds(ids);
          setDownloadMap(tokensMap);
        })
        .catch(err => console.error('Errore nel fetch acquisti:', err));
    }
  }, [auth]);

  const handlePlayPause = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const handleAcquista = async (track: Track) => {
    if (!auth || !auth.token) {
      notify.error('Devi essere loggato per acquistare.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ track_id: track.id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        notify.error(errorData.error || "Errore durante l'acquisto.");
        return;
      }

      const data = await res.json();

      notify.success('Acquisto completato! Verrai reindirizzato alla pagina di download.');
      setTimeout(() => {
        navigate(`/download/${data.download_token}`);
      }, 1000);

      const userRes = await fetch(`${API_URL}/auth/private`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (userRes.ok) {
        const userData = await userRes.json();

        if (typeof userData.user.tokens === 'number') {
          auth.setTokens(userData.user.tokens);
        }

        setPurchasedIds(prev => new Set([...prev, track.id]));
        setDownloadMap(prev => ({ ...prev, [track.id]: data.download_token }));
      }
    } catch (error) {
      if (error instanceof Error) notify.error(error.message);
      else notify.error('Errore di rete o del server.');
    }
  };

  return (
    <div className="max-w-4xl p-4 bg-zinc-900 text-white rounded mx-auto pb-40">
      <h1 className="text-2xl font-bold mb-6">Market - Acquista brani</h1>

      <input
        type="text"
        placeholder="Cerca titolo, artista o album..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full mb-6 p-2 rounded bg-zinc-700 text-white placeholder-zinc-400"
      />

      <ul>
        {tracksFromDB.map(track => {
          const isOwned = purchasedIds.has(track.id);
          const canDownload = downloadMap[track.id];

          return (
            <li key={track.id} className="market-item">
              <img
                src={`${COVER_URL}/${track.cover_path}`}
                alt={`Cover di ${track.titolo}`}
                className="market-cover"
              />
              <div className="market-info">
                <p className="market-title line-clamp-2 break-words text-ellipsis overflow-hidden">
                  {track.titolo}{' '}
                  {track.isUpdated && (
                    <span className="text-yellow-400 text-xs ml-2">(Nuovo!)</span>
                  )}
                </p>
                <p className="market-subtitle">
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
                  })} — <em>{track.album}</em>
                </p>
              </div>
              <div className="market-actions">
                <span className="market-price">{track.costo} token</span>
                {isOwned ? (
                  canDownload ? (
                    <button
                      onClick={() => navigate(`/download/${canDownload}`)}
                      className="market-button market-download"
                    >
                      Download
                    </button>
                  ) : (
                    <button disabled className="market-button market-disabled">
                      Acquistato
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleAcquista(track)}
                    className="market-button market-buy"
                  >
                    Acquista
                  </button>
                )}
                <button
                  onClick={() => handlePlayPause(track)}
                  className="btn-play ml-4"
                >
                  {currentTrack?.id === track.id && isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TracksMarket;
