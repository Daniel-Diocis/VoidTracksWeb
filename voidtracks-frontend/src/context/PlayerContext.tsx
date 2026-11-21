import {
  useCallback, useEffect, useMemo, useRef, useState,
  type ReactNode, type SyntheticEvent,
} from "react";
import type { PlayableTrack } from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import { PlayerContext, TimelineContext } from "./playerState";

type Playback = { queue: readonly PlayableTrack[]; index: number };
type Timeline = { position: number; duration: number };

const emptyTimeline = { position: 0, duration: 0 };

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playbackRef = useRef<Playback | null>(null);
  // A rejected play promise from an earlier track must not change the current UI.
  const request = useRef(0);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeline, setTimeline] = useState<Timeline>(emptyTimeline);
  const [volume, updateVolume] = useState(1);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentTrack = playback?.queue[playback.index] ?? null;

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !playbackRef.current) return;

    const attempt = ++request.current;
    setError(null);
    if (audio.error) audio.load();
    if (audio.ended) audio.currentTime = 0;
    setBuffering(audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA);
    void audio.play().catch((reason: unknown) => {
      if (attempt !== request.current) return;
      setIsPlaying(!audio.paused);
      setBuffering(false);
      if ((reason as DOMException | undefined)?.name !== "AbortError") {
        setError("Riproduzione non riuscita. Premi Riproduci per riprovare.");
      }
    });
  }, []);

  const pause = useCallback(() => {
    request.current++;
    audioRef.current?.pause();
    setIsPlaying(false);
    setBuffering(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current?.paused) play();
    else pause();
  }, [pause, play]);

  const stopPlayback = useCallback(() => {
    pause();
    playbackRef.current = null;
    setPlayback(null);
    setTimeline(emptyTimeline);
    setError(null);
    const audio = audioRef.current;
    if (audio) {
      audio.removeAttribute("src");
      audio.load();
    }
  }, [pause]);

  const startTrack = useCallback((next: Playback) => {
    const audio = audioRef.current;
    const track = next.queue[next.index];
    if (!audio || !track) return;

    const previous = playbackRef.current;
    const previousTrack = previous?.queue[previous.index];
    playbackRef.current = next;
    setPlayback(next);
    if (track.id !== previousTrack?.id || track.music_path !== previousTrack.music_path) {
      setIsPlaying(false);
      setTimeline(emptyTimeline);
      // Set the source within the user gesture so iOS Safari can start playback.
      audio.src = mediaUrl(import.meta.env.VITE_MUSIC_URL, track.music_path);
    }
    play();
  }, [play]);

  const toggleTrack = useCallback((track: PlayableTrack, entries: readonly PlayableTrack[] = [track]) => {
    const current = playbackRef.current;
    if (current?.queue[current.index].id === track.id) {
      togglePlayPause();
      return;
    }
    const index = entries.findIndex((entry) => entry.id === track.id);
    startTrack(index < 0 ? { queue: [track], index: 0 } : { queue: [...entries], index });
  }, [startTrack, togglePlayPause]);

  const playAt = useCallback((index: number) => {
    const current = playbackRef.current;
    if (!current?.queue[index]) return;
    startTrack({ queue: current.queue, index });
  }, [startTrack]);

  const playNext = useCallback(() => {
    const current = playbackRef.current;
    if (current) playAt(current.index + 1);
  }, [playAt]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || !Number.isFinite(seconds)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, seconds));
    setTimeline({ position: audio.currentTime, duration: audio.duration });
  }, []);

  const playPrevious = useCallback(() => {
    const current = playbackRef.current;
    if (!current) return;
    if (current.index === 0 || (audioRef.current?.currentTime ?? 0) > 3) seek(0);
    else playAt(current.index - 1);
  }, [playAt, seek]);

  const setVolume = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(value)) return;
    audio.volume = Math.max(0, Math.min(1, value));
    updateVolume(audio.volume);
  }, []);

  function syncTimeline(event: SyntheticEvent<HTMLAudioElement>) {
    if (!playbackRef.current) return;
    const { currentTime, duration } = event.currentTarget;
    setTimeline({ position: currentTime, duration: Number.isFinite(duration) ? duration : 0 });
  }

  function handleEnded() {
    const current = playbackRef.current;
    if (!current) return;
    if (!audioRef.current?.ended) return;
    if (current.queue[current.index + 1]) playNext();
    else {
      setIsPlaying(false);
      setBuffering(false);
    }
  }

  useEffect(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    if (typeof MediaMetadata !== "undefined") {
      session.metadata = new MediaMetadata({
        title: currentTrack.titolo, artist: currentTrack.artista, album: currentTrack.album,
        artwork: currentTrack.cover_path
          ? [{ src: mediaUrl(import.meta.env.VITE_COVER_URL, currentTrack.cover_path) }]
          : [],
      });
    }

    const actions: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", play], ["pause", pause], ["stop", stopPlayback],
      ["previoustrack", playPrevious], ["nexttrack", playNext],
      ["seekto", ({ seekTime }) => { if (seekTime !== undefined) seek(seekTime); }],
      ["seekbackward", ({ seekOffset }) => seek((audioRef.current?.currentTime ?? 0) - (seekOffset ?? 10))],
      ["seekforward", ({ seekOffset }) => seek((audioRef.current?.currentTime ?? 0) + (seekOffset ?? 10))],
    ];
    const registered = actions.filter(([action, handler]) => {
      try { session.setActionHandler(action, handler); return true; }
      catch { return false; }
    });

    return () => {
      registered.forEach(([action]) => session.setActionHandler(action, null));
      session.metadata = null;
    };
  }, [currentTrack, pause, play, playNext, playPrevious, seek, stopPlayback]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = currentTrack ? (isPlaying ? "playing" : "paused") : "none";
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !navigator.mediaSession.setPositionState) return;
    if (timeline.duration > 0) {
      navigator.mediaSession.setPositionState({
        duration: timeline.duration, position: Math.min(timeline.position, timeline.duration),
      });
    } else {
      navigator.mediaSession.setPositionState();
    }
  }, [timeline]);

  const player = useMemo(() => ({
    currentTrack, queue: playback?.queue ?? [], queueIndex: playback?.index ?? -1,
    isPlaying, toggleTrack, togglePlayPause, stopPlayback, playAt, playNext, playPrevious, seek, setVolume,
  }), [currentTrack, playback, isPlaying, toggleTrack, togglePlayPause, stopPlayback, playAt, playNext, playPrevious, seek, setVolume]);

  return (
    <PlayerContext.Provider value={player}>
      <TimelineContext.Provider value={{ ...timeline, volume, buffering, error }}>
        <audio
          ref={audioRef}
          data-voidtracks-audio
          preload="metadata"
          className="hidden"
          onTimeUpdate={syncTimeline}
          onLoadedMetadata={syncTimeline}
          onDurationChange={syncTimeline}
          onPlay={(event) => { if (!event.currentTarget.paused) setIsPlaying(true); }}
          onPlaying={() => setBuffering(false)}
          onWaiting={(event) => { if (!event.currentTarget.paused) setBuffering(true); }}
          onPause={(event) => {
            if (event.currentTarget.paused) {
              setIsPlaying(false);
              setBuffering(false);
            }
          }}
          onVolumeChange={(event) => updateVolume(event.currentTarget.volume)}
          onEnded={handleEnded}
          onError={(event) => {
            if (playbackRef.current && event.currentTarget.error) {
              setIsPlaying(false);
              setBuffering(false);
              setError("Impossibile caricare il brano. Premi Riproduci per riprovare.");
            }
          }}
        />
        {children}
      </TimelineContext.Provider>
    </PlayerContext.Provider>
  );
}
