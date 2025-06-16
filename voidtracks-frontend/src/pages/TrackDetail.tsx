import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

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
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/tracks`)
      .then(res => res.json())
      .then((tracks: Track[]) => {
        const trovato = tracks.find(t => t.music_path === music_path);
        setTrack(trovato || null);
      });
  }, [music_path]);

  useEffect(() => {
    if (track) {
      fetch(`${import.meta.env.VITE_API_URL}/hash/${track.music_path}`)
        .then(res => res.json())
        .then(data => setHash(data.hash));
    }
  }, [track]);

  if (!track) {
    return <p>Calcolo hash in corso...</p>;
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
      {hash && <p className="text-sm text-gray-500 break-all">Hash: {hash}</p>}
    </div>
  );
}