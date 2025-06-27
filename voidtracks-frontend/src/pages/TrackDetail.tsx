/**
 * TrackDetail.tsx
 *
 * Pagina di dettaglio per una singola traccia musicale.
 *
 * Funzionalità:
 * - Estrae il parametro `music_path` dall'URL tramite React Router
 * - Recupera la lista completa delle tracce dal backend e identifica quella corrispondente
 * - Mostra dettagli come titolo, artista, album, copertina e audio player
 *
 * Meccanismo:
 * - Chiamata `GET` a `/tracks` per ottenere l'elenco completo
 * - Ricerca locale della traccia corrispondente a `music_path`
 * - Gestione errori con `notify.error` in caso di fetch fallita o traccia non trovata
 *
 * UI:
 * - Visualizzazione del titolo, artista, album e copertina
 * - Player audio con `controls` e `nodownload` per limitarne l’utilizzo
 */

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { notify } from '../utils/toastManager';

const PUBLIC_URL = 'https://igohvppfcsipbmzpckei.supabase.co/storage/v1/object/public';

type Track = {
  id: string;
  titolo: string;
  artista: string;
  album: string;
  music_path: string;
  cover_path: string;
};

export default function TrackDetail() {
  const { music_path } = useParams();
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/tracks`)
      .then(async res => {
        if (!res.ok) throw new Error('Errore nel recupero dei brani');
        return res.json();
      })
      .then((tracks: Track[]) => {
        const trovato = tracks.find(t => t.music_path === music_path);
        if (!trovato) {
          notify.error('Traccia non trovata');
          return;
        }
        setTrack(trovato);
      })
      .catch(err => {
        console.error('Errore fetch tracce:', err);
        notify.error('Errore nel caricamento dei dati della traccia');
      });
  }, [music_path]);

  if (!track) {
    return (
      <div className="p-6 text-gray-400 italic">
        Caricamento dettagli traccia...
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-bold mb-2">{track.titolo}</h2>
      <p className="text-gray-400 mb-2">{track.artista} – {track.album}</p>
      <img
        src={`${PUBLIC_URL}/cover/${track.cover_path}`}
        alt={`Cover ${track.titolo}`}
        className="w-64 h-64 object-cover rounded-lg mb-4"
      />
      <audio controls controlsList="nodownload" src={`${PUBLIC_URL}/music/${track.music_path}`} className="w-full mb-4" />
    </div>
  );
}