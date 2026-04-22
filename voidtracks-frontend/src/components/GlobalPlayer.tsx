/**
 * Componente globale del player audio.
 *
 * Visualizza:
 * - un mini player fisso in basso
 * - una vista espansa full screen cliccando sulla cover
 *
 * Logica:
 * - utilizza un solo tag <audio> per evitare conflitti con audioRef
 * - usa PlayerContext per gestire lo stato globale
 * - supporta Media Session API
 * - al termine del brano passa al successivo, oppure riparte dal primo
 */

import { useEffect, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { SkipBack, SkipForward, ChevronDown} from "lucide-react";

const MUSIC_URL = import.meta.env.VITE_MUSIC_URL;
const COVER_URL = import.meta.env.VITE_COVER_URL;

/**
 * Componente principale del player globale.
 * Mostra i controlli di riproduzione se c'è un brano attivo.
 */
export default function GlobalPlayer() {
  const {
    currentTrack,
    isPlaying,
    audioRef,
    stopPlayback,
    playNext,
    playPrevious,
    tracks,
    setCurrentTrack,
    setIsPlaying,
  } = usePlayer();

  const [isExpanded, setIsExpanded] = useState(false);

  // Avvia o mette in pausa l'audio in base allo stato globale
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, audioRef]);

  // Media Session API
  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.titolo,
      artist: currentTrack.artista,
      album: currentTrack.album,
      artwork: [
        {
          src: `${COVER_URL}/${currentTrack.cover_path}`,
          sizes: "512x512",
          type: "image/png",
        },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      setIsPlaying(true);
      audioRef.current?.play();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      setIsPlaying(false);
      audioRef.current?.pause();
    });

    navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
    navigator.mediaSession.setActionHandler("nexttrack", playNext);
    navigator.mediaSession.setActionHandler("stop", stopPlayback);

    return () => {
      // Pulizia opzionale dei gestori quando il track cambia
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("stop", null);
    };
  }, [currentTrack, setIsPlaying, playNext, playPrevious, stopPlayback, audioRef]);

  const handleEnded = () => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    const isLast = currentIndex === tracks.length - 1;

    if (isLast) {
      const firstTrack = tracks[0];
      if (firstTrack) {
        setCurrentTrack(firstTrack);
        setIsPlaying(true);
      }
    } else {
      playNext();
    }
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* PLAYER ESPANSO */}
      {isExpanded && (
        <div className="fixed inset-0 z-[60] bg-zinc-900 text-white flex flex-col">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white"
              aria-label="Riduci player"
            >
              <ChevronDown size={30} />
            </button>

            <button
              onClick={stopPlayback}
              className="text-white text-sm"
              aria-label="Chiudi player"
            >
              Close
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
            <img
              src={`${COVER_URL}/${currentTrack.cover_path}`}
              alt={`Cover ${currentTrack.album}`}
              className="w-full max-w-md aspect-square object-cover rounded-2xl shadow-2xl mb-8"
            />

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">{currentTrack.titolo}</h2>
              <p className="text-zinc-300 mt-2">{currentTrack.artista}</p>
              <p className="text-zinc-500 text-sm mt-1">{currentTrack.album}</p>
            </div>

            <div className="w-full max-w-4xl flex items-center gap-6 px-6">
              <button
                onClick={playPrevious}
                className="text-white hover:text-zinc-300"
                aria-label="Brano precedente"
              >
                <SkipBack size={34} />
              </button>

              <audio
                ref={audioRef}
                preload="auto"
                controls
                controlsList="nodownload"
                src={`${MUSIC_URL}/${currentTrack.music_path}`}
                className="flex-grow"
                onEnded={handleEnded}
              />

              <button
                onClick={playNext}
                className="text-white hover:text-zinc-300"
                aria-label="Brano successivo"
              >
                <SkipForward size={34} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MINI PLAYER */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-800 p-4 flex items-center gap-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="shrink-0"
          aria-label="Apri player espanso"
        >
          <img
            src={`${COVER_URL}/${currentTrack.cover_path}`}
            alt={`Cover ${currentTrack.album}`}
            className="w-16 h-16 object-cover rounded cursor-pointer"
          />
        </button>

        <div className="flex flex-col min-w-0">
          <span className="font-bold truncate">{currentTrack.titolo}</span>
          <span className="text-sm text-gray-400 truncate">
            {currentTrack.artista}
          </span>
        </div>

        <div className="flex items-center gap-3 ml-4 flex-grow">
          <button
            onClick={playPrevious}
            className="text-white"
            aria-label="Brano precedente"
          >
            <SkipBack size={24} />
          </button>

          <audio
            ref={audioRef}
            preload="auto"
            controls
            controlsList="nodownload"
            src={`${MUSIC_URL}/${currentTrack.music_path}`}
            className="flex-grow"
            onEnded={handleEnded}
          />

          <button
            onClick={playNext}
            className="text-white"
            aria-label="Brano successivo"
          >
            <SkipForward size={24} />
          </button>
        </div>

        <button
          onClick={stopPlayback}
          className="ml-4 text-white"
          aria-label="Chiudi player"
        >
          Close
        </button>
      </div>
    </>
  );
}