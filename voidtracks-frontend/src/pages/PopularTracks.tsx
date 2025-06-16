import { useEffect, useState } from 'react';

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
        console.error('Errore nel recupero dei brani più popolari:', error);
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
                    src={`https://igohvppfcsipbmzpckei.supabase.co/storage/v1/object/public/cover/${item.Track.cover_path}`}
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