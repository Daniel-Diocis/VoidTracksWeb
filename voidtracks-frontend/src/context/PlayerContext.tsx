/**
 * PlayerContext.tsx
 *
 * Contesto globale per la gestione del player musicale.
 * Fornisce:
 * - Stato del brano attuale, lista dei brani disponibili e controllo della riproduzione
 * - Riferimento all'elemento <audio> per controlli diretti
 * - Funzioni per play, pausa, stop, traccia successiva/precedente
 *
 * Questo contesto consente la riproduzione centralizzata e condivisa in tutta l'app.
 */

import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
  type RefObject,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Track } from '../types';


/** Tipo del contesto del player musicale */
type PlayerContextType = {
  currentTrack: Track | null;
  setCurrentTrack: Dispatch<SetStateAction<Track | null>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  audioRef: RefObject<HTMLAudioElement>;
  tracks: Track[];
  setTracks: Dispatch<SetStateAction<Track[]>>;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  stopPlayback: () => void;
  playNext: () => void;
  playPrevious: () => void;
};

/** Creazione del contesto */
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

/**
 * PlayerProvider
 *
 * Provider React che gestisce il player musicale globale.
 * Mantiene lo stato del brano corrente, la lista dei brani, e i controlli di riproduzione.
 */
export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null!);

  /**
   * playTrack
   *
   * Imposta un nuovo brano da riprodurre e avvia la riproduzione.
   */
  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  /**
   * togglePlayPause
   *
   * Alterna tra stato di riproduzione e pausa.
   */
  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  /**
   * stopPlayback
   *
   * Ferma la riproduzione e resetta il brano corrente.
   */
  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentTrack(null);
  };


  /**
   * playNext
   *
   * Passa al brano successivo nella lista, o torna al primo se alla fine.
   */
  const playNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = currentIndex + 1;

    const nextTrack = tracks[nextIndex] || tracks[0]; // loop
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
  };


  /**
   * playPrevious
   *
   * Se il brano è iniziato da più di 3 secondi, lo riavvia.
   * Altrimenti torna al brano precedente, o all'ultimo se siamo al primo.
   */
  const playPrevious = () => {
    if (!currentTrack || tracks.length === 0 || !audioRef.current) return;

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const currentTime = audioRef.current.currentTime;

    if (currentTime > 3) {
      // Riavvia il brano corrente
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      const newIndex =
        currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
      const prevTrack = tracks[newIndex];
      setCurrentTrack(prevTrack);
      setIsPlaying(true);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        audioRef,
        tracks,
        setTracks,
        playTrack,
        togglePlayPause,
        stopPlayback,
        playNext,
        playPrevious,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

/**
 * usePlayer
 *
 * Hook personalizzato per accedere al contesto Player.
 * Solleva un errore se usato fuori dal PlayerProvider.
 */
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
