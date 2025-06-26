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

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null!);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  const playNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = currentIndex + 1;

    const nextTrack = tracks[nextIndex] || tracks[0]; // loop
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
  };

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

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
