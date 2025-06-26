import { useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { SkipBack, SkipForward } from "lucide-react";

const PUBLIC_URL =
  "https://igohvppfcsipbmzpckei.supabase.co/storage/v1/object/public";

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

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

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
              // Riparti dal primo brano
              const firstTrack = tracks[0];
              setCurrentTrack(firstTrack);
              setIsPlaying(true);
            } else {
              // Vai al brano successivo
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
