import { useEffect, useState, useContext } from 'react';
import { loadLocalTimestamps, saveLocalTimestamps } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    if (auth?.token) {
      console.log('TOKEN CONTROLLATO:', auth.token);
      fetch(`${API_URL}/purchase`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })
        .then(async res => {
          if (!res.ok) {
            throw new Error('Errore nel recupero degli acquisti');
          }
          const json = await res.json();
          const purchases: { track_id: string; download_token: string; used_flag: boolean }[] = json.data;
          console.log('Risposta acquisti:', purchases);
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

  const handleAcquista = async (track: Track) => {
    if (!auth || !auth.token) {
      alert('Devi essere loggato per acquistare.');
      return;
    }

    try {
        console.log('TOKEN USATO:', auth.token);
      const res = await fetch(`${API_URL}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ track_id: track.id }),
      });

    if (!res.ok) {
    const errorData = await res.json().catch(() => ({})); // evita crash se non è JSON
    alert(errorData.error || 'Errore durante l\'acquisto.');
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
        console.log('Risposta da /auth/private:', userData);

        if (typeof userData.user.tokens === 'number') {
            auth.setTokens(userData.user.tokens);
            console.log('Token aggiornati:', userData.user.tokens);
        } else {
            console.warn('⚠️ userData.user.tokens mancante o non numerico:', userData.user);
        }

        setPurchasedIds(prev => new Set([...prev, track.id]));
        setDownloadMap(prev => ({ ...prev, [track.id]: data.download_token }));
        }

    } catch (error) {
    console.error('Errore durante l\'acquisto:', error);
    if (error instanceof Error) alert(error.message);
    else alert('Errore di rete o del server.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-zinc-900 text-white rounded">
      <h1 className="text-2xl font-bold mb-6">Market - Acquista brani</h1>
      {/* Input di ricerca */}
      <input
        type="text"
        placeholder="Cerca titolo, artista o album..."
        value={query}
        onChange={e => setQuery(e.target.value)} // aggiorna query e fa partire fetch
        className="w-full mb-6 p-2 rounded bg-zinc-700 text-white placeholder-zinc-400"
      />
      {/* Lista tracce */}
      <ul>
        {tracks.map(track => {
          const isOwned = purchasedIds.has(track.id);
          const canDownload = downloadMap[track.id];

          return (
            <li
              key={track.id}
              className="market-item"
            >
              <img
                src={`${PUBLIC_URL}/cover/${track.cover_path}`}
                alt={`Cover di ${track.titolo}`}
                className='market-cover'
              />
              <div className="market-info">
                <p className="market-title">
                  {track.titolo}{' '}
                  {track.isUpdated && (
                    <span className="text-yellow-400 text-xs ml-2">(Nuovo!)</span>
                  )}
                </p>
                <p className="market-subtitle">
                  {track.artista} — <em>{track.album}</em>
                </p>
                <audio
                  controls
                  controlsList="nodownload"
                  src={`${PUBLIC_URL}/music/${track.music_path}`}
                  className="market-audio"
                />
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
                    <button
                      disabled
                      className="market-button market-disabled"
                    >
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
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TracksMarket;