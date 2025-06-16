import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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
  const [error, setError] = useState('');
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
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [download_token]);

    const handleDownload = () => {
    window.open(`${API_URL}/purchase/download/${download_token}`, '_blank');
    setDownloaded(true);
    };

  if (loading) return <p className="text-center mt-10">Caricamento...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
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