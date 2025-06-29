/**
 * Componente globale del player audio.
 * 
 * Visualizza un player fisso in basso con:
 * - Copertina del brano in riproduzione
 * - Titolo e artista
 * - Controlli: brano precedente, successivo, stop
 * - Audio player nativo (senza download)
 * 
 * Logica:
 * - Utilizza il contesto globale PlayerContext per controllare lo stato del player
 * - Al termine del brano, passa automaticamente al successivo
 * - Se si arriva all'ultimo brano, riparte dal primo
 */

import { useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { SkipBack, SkipForward } from "lucide-react";

const PUBLIC_URL =
  "https://igohvppfcsipbmzpckei.supabase.co/storage/v1/object/public";

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

  // Effetto: avvia o mette in pausa l'audio in base allo stato globale
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // Se non c'è un brano selezionato, il player non viene mostrato
  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-800 p-4 flex items-center gap-4 z-50">
      <img
        src={`${PUBLIC_URL}/cover/${currentTrack.cover_path}`}
        alt={`Cover ${currentTrack.album}`}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex flex-col">
        <span className="font-bold">{currentTrack.titolo}</span>
        <span className="text-sm text-gray-400">{currentTrack.artista}</span>
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
          src={`${PUBLIC_URL}/music/${currentTrack.music_path}`}
          className="flex-grow"
          onEnded={() => {
            const currentIndex = tracks.findIndex(
              (t) => t.id === currentTrack.id
            );
            const isLast = currentIndex === tracks.length - 1;

            if (isLast) {
              const firstTrack = tracks[0];
              setCurrentTrack(firstTrack);
              setIsPlaying(true);
            } else {
              playNext();
            }
          }}
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
  );
}