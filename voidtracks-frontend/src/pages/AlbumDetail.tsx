/**
 * Pagina di dettaglio per un album.
 *
 * Mostra le informazioni principali dell'album e l'elenco dei brani associati.
 * La riproduzione viene gestita tramite PlayerContext e GlobalPlayer.
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { notify } from "../utils/toastManager";
import { usePlayer } from "../context/PlayerContext";
import type { Track } from "../types";

const COVER_URL = import.meta.env.VITE_COVER_URL;

type AlbumResponse = {
  album: string;
  tracks: Track[];
};

export default function AlbumDetail() {
  const { albumName } = useParams();

  const [albumData, setAlbumData] = useState<AlbumResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    setTracks,
  } = usePlayer();

  useEffect(() => {
    if (!albumName) return;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    fetch(`${API_URL}/albums/${encodeURIComponent(albumName)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Album non trovato");
        return res.json();
      })
      .then((data: AlbumResponse) => {
        const orderedTracks = [...data.tracks].sort((a, b) =>
          a.titolo.localeCompare(b.titolo)
        );

        setAlbumData({
          album: data.album,
          tracks: orderedTracks,
        });

        setTracks(orderedTracks);

        if (orderedTracks.length > 0) {
          playTrack(orderedTracks[0]);
        }
      })
      .catch((err) => {
        console.error("Errore nel caricamento album:", err);
        notify.error("Errore nel caricamento album");
        setAlbumData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [albumName]);

  if (loading) return <p className="text-white">Caricamento album...</p>;

  if (!albumData || albumData.tracks.length === 0) {
    return <p className="text-white">Album non trovato.</p>;
  }

  const firstTrack = albumData.tracks[0];

  return (
    <div className="p-6 text-white max-w-3xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <img
          src={`${COVER_URL}/${firstTrack.cover_path}`}
          alt={`Cover ${albumData.album}`}
          className="w-56 h-56 object-cover rounded-2xl shadow-lg"
        />

        <div className="flex flex-col justify-center">
          <p className="text-sm uppercase text-zinc-400 mb-2">Album</p>
          <h1 className="text-4xl font-bold mb-3">{albumData.album}</h1>
          <p className="text-zinc-300">{firstTrack.artista}</p>
          <p className="text-zinc-500 text-sm mt-2">
            {albumData.tracks.length} brani
          </p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Brani</h2>

      <div className="flex flex-col gap-3">
        {albumData.tracks.map((track, index) => (
          <div
            key={track.id}
            className="flex items-center gap-4 bg-zinc-800 p-3 rounded-lg"
          >
            <span className="text-zinc-500 w-6">{index + 1}</span>

            <img
              src={`${COVER_URL}/${track.cover_path}`}
              alt={`Cover ${track.titolo}`}
              className="w-14 h-14 object-cover rounded"
            />

            <div className="flex-grow min-w-0">
              <p className="font-semibold truncate">{track.titolo}</p>
              <p className="text-sm text-gray-400 truncate">{track.artista}</p>
            </div>

            <button
              onClick={() => {
                if (currentTrack?.id === track.id) {
                  togglePlayPause();
                } else {
                  setTracks(albumData.tracks);
                  playTrack(track);
                }
              }}
              className="btn-play px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700"
            >
              {currentTrack?.id === track.id && isPlaying ? "Pause" : "Play"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}