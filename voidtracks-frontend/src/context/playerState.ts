import { createContext, useContext } from "react";
import type { PlayableTrack } from "../types";

type Player = {
  currentTrack: PlayableTrack | null;
  queue: readonly PlayableTrack[];
  queueIndex: number;
  isPlaying: boolean;
  toggleTrack: (track: PlayableTrack, queue?: readonly PlayableTrack[]) => void;
  togglePlayPause: () => void;
  stopPlayback: () => void;
  playAt: (index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
};

type PlayerTimeline = { position: number; duration: number } & { volume: number; buffering: boolean; error: string | null };

export const PlayerContext = createContext<Player | null>(null);
export const TimelineContext = createContext<PlayerTimeline | null>(null);

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
}

export function usePlayerTimeline() {
  const context = useContext(TimelineContext);
  if (!context) throw new Error("usePlayerTimeline must be used within a PlayerProvider");
  return context;
}
