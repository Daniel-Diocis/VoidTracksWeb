import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePlayer } from "../context/playerState";
import type { PlayableTrack } from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import { notify } from "../utils/toastManager";

type Artist = {
  id: string;
  nome: string;
  genere?: string;
  paese?: string;
  descrizione?: string;
  profile_path?: string;
  Tracks?: (Omit<PlayableTrack, "artista"> & { artista?: string })[];
};

export default function ArtistDetail() {
  const { nome } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const { currentTrack, isPlaying, toggleTrack } = usePlayer();

  useEffect(() => {
    if (!nome) return;
    const controller = new AbortController();
    const api = import.meta.env.VITE_API_URL || "/api";
    fetch(`${api}/artists/byName/${encodeURIComponent(nome)}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Artista non trovato");
        return res.json();
      })
      .then(setArtist)
      .catch(() => {
        if (controller.signal.aborted) return;
        notify.error("Errore nel caricamento artista");
        setArtist(null);
      });
    return () => controller.abort();
  }, [nome]);

  if (!artist) return <p>Caricamento artista in corso...</p>;

  const tracks = (artist.Tracks ?? [])
    .map((track) => ({ ...track, artista: track.artista || artist.nome }))
    .sort((a, b) => a.titolo.localeCompare(b.titolo));

  return (
    <div className="p-6 text-white max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{artist.nome}</h2>
      {artist.profile_path && (
        <img src={mediaUrl(import.meta.env.VITE_PROFILE_URL, artist.profile_path)}
          alt={`Foto di ${artist.nome}`} className="w-48 h-48 object-cover rounded-lg mb-4" />
      )}
      <p className="mb-2"><strong>Genere:</strong> {artist.genere || "Non specificato"}</p>
      <p className="mb-2"><strong>Paese:</strong> {artist.paese || "Non specificato"}</p>
      <p className="whitespace-pre-wrap mb-6">{artist.descrizione || "Nessuna descrizione disponibile."}</p>

      <div className="flex flex-col gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="flex items-center gap-4 bg-zinc-800 p-2 rounded">
            <img src={mediaUrl(import.meta.env.VITE_COVER_URL, track.cover_path)}
              alt={`Cover ${track.titolo}`} className="w-16 h-16 object-cover rounded shrink-0" />
            <div className="min-w-0 flex-grow">
              <p className="font-semibold break-words">{track.titolo}</p>
              <p className="text-sm text-gray-400 italic break-words">{track.album}</p>
            </div>
            <button type="button" onClick={() => toggleTrack(track, tracks)}
              className="btn-play shrink-0 px-3 py-2 bg-cyan-600 rounded hover:bg-cyan-700">
              {currentTrack?.id === track.id && isPlaying ? "Pausa" : "Riproduci"}
            </button>
          </div>
        ))}
        {!tracks.length && <p>Nessun brano associato.</p>}
      </div>
    </div>
  );
}
