/**
 * DownloadPage.tsx
 *
 * Pagina dedicata al download sicuro di un brano acquistato dall'utente.
 * Accessibile tramite un token temporaneo presente nell'URL.
 *
 * Funzionalità:
 * - Recupera le informazioni del brano associato a un token tramite la rotta GET `/purchase/:download_token`
 * - Verifica se il token è valido e se il brano è scaricabile (`canDownload`)
 * - Mostra i dettagli del brano (titolo, artista, album, copertina)
 * - Consente un singolo download sicuro tramite link temporaneo
 * - Mostra messaggi di feedback all’utente tramite notifiche toast
 *
 * Stato interno:
 * - `track`: dati del brano da scaricare
 * - `loading`: stato di caricamento iniziale
 * - `downloaded`: flag per disabilitare il download dopo l’avvio
 *
 * Dipendenze:
 * - Utilizza Supabase Storage per caricare la copertina del brano
 * - Utilizza `toastManager` per mostrare notifiche
 * - I download vengono gestiti tramite apertura in una nuova finestra (evita blocchi del browser)
 *
 * UI:
 * - Card centrale con dettagli brano e pulsante di download
 * - Visual feedback differenziato per stato di download
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { notify } from '../utils/toastManager';

type TrackInfo = {
  titolo: string;
  artista: string;
  album: string;
  cover_path: string;
  canDownload: boolean;
};

const PUBLIC_URL = 'https://igohvppfcsipbmzpckei.supabase.co/storage/v1/object/public';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function DownloadPage() {
  const { download_token } = useParams();
  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/purchase/${download_token}`)
      .then(res => {
        if (!res.ok) throw new Error('Token non valido o scaduto');
        return res.json();
      })
      .then(data => {
        setTrack(data);
      })
      .catch(err => {
        notify.error(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [download_token]);

    const handleDownload = () => {
    window.open(`${API_URL}/purchase/download/${download_token}`, '_blank');
    setDownloaded(true);
    notify.success('Download avviato con successo');
    };

  if (loading) return <p className="text-center mt-10">Caricamento...</p>;
  if (!track) return null;

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-zinc-900 text-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Download brano</h1>
      <div className="flex gap-4 items-center">
        <img
          src={`${PUBLIC_URL}/cover/${track.cover_path}`}
          alt={`Cover di ${track.titolo}`}
          className="w-32 h-32 object-cover rounded"
        />
        <div>
          <p className="text-lg font-semibold">{track.titolo}</p>
          <p className="text-sm text-gray-400">
            {track.artista} — <em>{track.album}</em>
          </p>
        </div>
      </div>

      <div className="mt-6">
        {track.canDownload && !downloaded ? (
          <button
            onClick={handleDownload}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Scarica ora
          </button>
        ) : downloaded ? (
          <p className="text-yellow-400 mt-4">Download effettuato ✅</p>
        ) : (
          <p className="text-red-400 mt-4">Link non valido o già utilizzato ❌</p>
        )}
      </div>
    </div>
  );
}