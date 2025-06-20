import { useEffect, useState, useContext, useRef } from 'react';
import { loadLocalTimestamps, saveLocalTimestamps } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

type Track = {
  id: string;
  titolo: string;
  artista: string;
  album: string;
  costo: number;
  cover_path: string;
  music_path: string;
  updated_at: string;
  isUpdated?: boolean;
};

const PUBLIC_URL = 'https://igohvppfcsipbmzpckei.supabase.co/storage/v1/object/public';

const TracksMarket = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [query, setQuery] = useState('');
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [downloadMap, setDownloadMap] = useState<Record<string, string>>({});
  const auth = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const navigate = useNavigate();

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch tracks e gestione timestamps
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
      .catch(err => console.error('Errore nel fetch:', err));
  }, [query]);

  // Fetch acquisti
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

  // Controllo play/pause audio HTML nativo
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // Funzione play/pause bottone
  const togglePlayPause = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  // Funzione acquisto
  const handleAcquista = async (track: Track) => {
    if (!auth || !auth.token) {
      alert('Devi essere loggato per acquistare.');
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
        alert(errorData.error || "Errore durante l'acquisto.");
        return;
      }

      const data = await res.json();

      alert('Acquisto completato! Verrai reindirizzato alla pagina di download.');
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
      if (error instanceof Error) alert(error.message);
      else alert('Errore di rete o del server.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-zinc-900 text-white rounded">
      <h1 className="text-2xl font-bold mb-6">Market - Acquista brani</h1>

      <input
        type="text"
        placeholder="Cerca titolo, artista o album..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full mb-6 p-2 rounded bg-zinc-700 text-white placeholder-zinc-400"
      />

      {/* Player fisso in basso */}
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
            ref={audioRef}
            controls
            controlsList="nodownload"
            src={`${PUBLIC_URL}/music/${currentTrack.music_path}`}
            className="flex-grow"
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTrack(null);
            }}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentTrack(null);
            }}
            className="ml-4 text-white"
          >
            Close
          </button>
        </div>
      )}

      {/* Lista tracce */}
      <ul>
        {tracks.map(track => {
          const isOwned = purchasedIds.has(track.id);
          const canDownload = downloadMap[track.id];

          return (
            <li key={track.id} className="market-item">
              <img
                src={`${PUBLIC_URL}/cover/${track.cover_path}`}
                alt={`Cover di ${track.titolo}`}
                className="market-cover"
              />
              <div className="market-info">
                <p className="market-title">
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
                  onClick={() => togglePlayPause(track)}
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