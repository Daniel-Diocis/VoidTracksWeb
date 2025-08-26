/**
 * Pagina che mostra i brani più acquistati dagli utenti.
 *
 * Funzionalità:
 * - Recupera dal backend la lista dei brani ordinati per numero di acquisti
 * - Mostra per ogni brano copertina, titolo, artista, album e numero di acquisti
 *
 * Meccanismo:
 * - Effettua una chiamata `GET` all'endpoint `/tracks/popular` al primo render
 * - Gestisce loading, errori e stato dei dati tramite `useState` e `useEffect`
 *
 * UI:
 * - Layout responsive con elenco dei brani in stile card
 * - Mostra un messaggio in caso di lista vuota o errore
 *
 * Dati utilizzati:
 * - `track_id`: id del brano
 * - `num_acquisti`: numero totale di acquisti
 * - `Track`: oggetto contenente informazioni sul brano
 */

import { useEffect, useState } from 'react';
import { notify } from '../utils/toastManager';

const COVER_URL = import.meta.env.VITE_COVER_URL;

interface PopularTrack {
  track_id: number;
  num_acquisti: number;
  Track: {
    id: number;
    titolo: string;
    artista: string;
    album: string;
    cover_path: string;
  };
}

function PopularTracks() {
  const [tracks, setTracks] = useState<PopularTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularTracks = async () => {
      try {
        const response = await fetch('http://localhost:3000/tracks/popular');
        const data = await response.json();
        setTracks(data);
      } catch (error) {
        notify.error('Errore nel recupero dei brani più acquistati');
        console.error('Errore nel recupero dei brani più acquistati:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularTracks();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Brani più acquistati</h2>
      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <ul className="space-y-4">
          {tracks.length === 0 ? (
            <p>Nessun dato disponibile.</p>
          ) : (
            tracks.map((item) => (
              <li key={item.Track.id} className="border p-4 rounded shadow-sm flex gap-4">
                {item.Track.cover_path && (
                  <img
                    src={`${COVER_URL}/${item.Track.cover_path}`}
                    alt="cover"
                      style={{
                      width: '150px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '0.375rem',
                    }}
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{item.Track.titolo}</h3>
                  <p className="text-sm text-gray-600">
                    {item.Track.artista} – {item.Track.album}
                  </p>
                  <p className="text-xs mt-1 text-gray-500">Acquisti: {item.num_acquisti}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default PopularTracks;