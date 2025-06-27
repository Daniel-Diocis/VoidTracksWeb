/**
 * ArtistDetail.tsx
 *
 * Pagina di dettaglio per un artista musicale.
 * Mostra informazioni biografiche e i brani associati, con possibilità di ascolto diretto.
 *
 * Funzionalità:
 * - Recupera i dati di un artista tramite il parametro `nome` dalla rotta `/artists/byName/:nome`
 * - Visualizza nome, genere, paese, descrizione e immagine profilo dell’artista
 * - Elenca tutti i brani dell’artista con titolo, album e copertina
 * - Permette di riprodurre i brani direttamente nella pagina con controlli play/pausa
 * - Mostra un mini player fisso in basso quando un brano è in riproduzione
 *
 * Stato interno:
 * - `artist`: oggetto artista con informazioni e lista brani
 * - `currentTrack`: brano selezionato per la riproduzione
 * - `isPlaying`: stato della riproduzione audio
 *
 * Contesto:
 * - Utilizza `useParams` per recuperare il nome artista dalla URL
 * - Mostra notifiche in caso di errore nel fetch
 *
 * Dipendenze:
 * - Lettore audio HTML5 (`<audio>`) collegato tramite `ref`
 * - URL pubblici delle risorse caricati da Supabase Storage
 *
 * UI:
 * - Stile responsive, dark mode
 * - Pulsanti play/pausa associati a ciascun brano
 */
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { notify } from '../utils/toastManager';

const PUBLIC_URL =
  "https://igohvppfcsipbmzpckei.supabase.co/storage/v1/object/public";

type Track = {
  id: string;
  titolo: string;
  album: string;
  music_path: string;
  cover_path: string;
  artista: string; // aggiunto artista per mostrare nel player
};

type Artist = {
  id: string;
  nome: string;
  genere?: string;
  paese?: string;
  descrizione?: string;
  profile_path?: string;
  Tracks?: Track[]; // brani associati
};

export default function ArtistDetail() {
  const { nome } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!nome) return;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    fetch(`${API_URL}/artists/byName/${encodeURIComponent(nome)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Artista non trovato");
        return res.json();
      })
      .then((data: Artist) => setArtist(data))
      .catch((err) => {
        notify.error("Errore nel caricamento artista");
        console.error("Errore nel fetch artista:", err);
        setArtist(null);
      });
  }, [nome]);
  useEffect(() => {
  if (audioRef.current) {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }
}, [isPlaying, currentTrack]);

  if (!artist) return <p>Caricamento artista in corso...</p>;

  return (
    <div className="p-6 text-white max-w-xl mx-auto pb-32">
      <h2 className="text-2xl font-bold mb-4">{artist.nome}</h2>
      {artist.profile_path && (
        <img
          src={`${PUBLIC_URL}/profile/${artist.profile_path}`}
          alt={`Foto di ${artist.nome}`}
          className="w-48 h-48 object-cover rounded-lg mb-4"
        />
      )}
      <p className="mb-2">
        <strong>Genere:</strong> {artist.genere || "Non specificato"}
      </p>
      <p className="mb-2">
        <strong>Paese:</strong> {artist.paese || "Non specificato"}
      </p>
      <p className="whitespace-pre-wrap mb-6">
        {artist.descrizione || "Nessuna descrizione disponibile."}
      </p>

      {/* Lista brani */}
      <div className="flex flex-col gap-4">
        {artist.Tracks && artist.Tracks.length > 0 ? (
            [...artist.Tracks]
            .sort((a, b) => a.titolo.localeCompare(b.titolo)) // ordina per titolo
            .map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-4 bg-zinc-800 p-2 rounded"
            >
              <img
                src={`${PUBLIC_URL}/cover/${track.cover_path}`}
                alt={`Cover ${track.titolo}`}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-grow">
                <p className="font-semibold">{track.titolo}</p>
                <p className="text-sm text-gray-400 italic">{track.album}</p>
              </div>
                <button
                onClick={() => {
                    if (currentTrack?.id === track.id) {
                    // Se clicco sul brano già in riproduzione, alterna play/pausa
                    setIsPlaying(!isPlaying);
                    } else {
                    // Altrimenti cambio brano e imposto play
                    setCurrentTrack(track);
                    setIsPlaying(true);
                    }
                }}
                className="btn-play px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700"
                >
                {currentTrack?.id === track.id && isPlaying ? 'Pause' : 'Play'}
                </button>
            </div>
          ))
        ) : (
          <p>Nessun brano associato.</p>
        )}
      </div>

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
            />
            <button onClick={() => {
            setIsPlaying(false);
            setCurrentTrack(null);
            }} className="ml-4 text-white">
            Close
            </button>
        </div>
        )}
    </div>
  );
}
