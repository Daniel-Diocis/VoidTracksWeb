import { Link } from "react-router-dom";
import { useLayoutEffect, useRef, useState } from "react";
import {
  ChevronDown, ChevronUp, ListMusic, Music2, Pause, Play, SkipBack, SkipForward, Volume2, X,
} from "lucide-react";
import { usePlayer, usePlayerTimeline } from "../context/playerState";
import type { PlayableTrack } from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import "./GlobalPlayer.css";

function formatTime(value: number) {
  const seconds = Math.floor(value);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function Artwork({ track, lazy }: { track: PlayableTrack; lazy?: boolean }) {
  const src = track.cover_path ? mediaUrl(import.meta.env.VITE_COVER_URL, track.cover_path) : undefined;
  const [failedSource, setFailedSource] = useState<string>();
  return (
    <span className="player-artwork" aria-hidden="true">
      <Music2 />
      {src && failedSource !== src && <img src={src} alt="" loading={lazy ? "lazy" : undefined} onError={() => setFailedSource(src)} />}
    </span>
  );
}

function Transport({ compact = false }: { compact?: boolean }) {
  const { isPlaying, queueIndex, queue, togglePlayPause, playPrevious, playNext } = usePlayer();
  const { position, duration } = usePlayerTimeline();
  return (
    <div className="player-transport">
      <button type="button" className={`player-icon ${compact ? "player-compact-previous" : ""}`}
        aria-label="Brano precedente" onClick={playPrevious} disabled={queueIndex === 0 && (!duration || position === 0)}>
        <SkipBack aria-hidden="true" />
      </button>
      <button type="button" className="player-icon player-play" onClick={togglePlayPause}
        aria-label={isPlaying ? "Pausa" : "Riproduci"}>
        {isPlaying ? <Pause aria-hidden="true" fill="currentColor" /> : <Play aria-hidden="true" fill="currentColor" />}
      </button>
      <button type="button" className="player-icon" aria-label="Brano successivo" onClick={playNext}
        disabled={queueIndex >= queue.length - 1}>
        <SkipForward aria-hidden="true" />
      </button>
    </div>
  );
}

function SeekBar() {
  const { seek } = usePlayer();
  const { position, duration } = usePlayerTimeline();
  return (
    <div className="player-seek">
      <span aria-hidden="true">{formatTime(position)}</span>
      <input type="range" min={0} max={duration || 1} step="any" value={Math.min(position, duration)}
        disabled={!duration} aria-label="Posizione nel brano" aria-valuetext={`${formatTime(position)} di ${formatTime(duration)}`}
        onChange={(event) => seek(event.currentTarget.valueAsNumber)} />
      <span aria-hidden="true">{formatTime(duration)}</span>
    </div>
  );
}

function Volume() {
  const { setVolume } = usePlayer();
  const { volume } = usePlayerTimeline();
  return (
    <label className="player-volume">
      <Volume2 aria-hidden="true" />
      <input type="range" min={0} max={100} step={1} value={Math.round(volume * 100)}
        aria-label="Volume" aria-valuetext={`${Math.round(volume * 100)}%`}
        onChange={(event) => setVolume(event.currentTarget.valueAsNumber / 100)} />
    </label>
  );
}

function PlaybackStatus() {
  const { buffering, error } = usePlayerTimeline();
  if (error) return <p role="alert" className="player-message player-error">{error}</p>;
  if (buffering) return <p role="status" className="player-message">Caricamento audio…</p>;
  return null;
}

function Queue() {
  const { queue, queueIndex, playAt } = usePlayer();
  return (
    <section className="player-queue" id="player-queue" aria-labelledby="player-queue-title">
      <h3 id="player-queue-title">Coda</h3>
      <ol>
        {queue.slice(queueIndex).map((entry, index) => (
          <li key={entry.id}>
            <button type="button" aria-current={index === 0 ? "true" : undefined}
              onClick={() => playAt(queueIndex + index)}>
              <Artwork track={entry} lazy />
              <span className="player-queue-info">
                <strong>{entry.titolo}</strong>
                <small>{entry.artista}</small>
              </span>
              {index === 0 ? <Music2 className="player-queue-current" aria-hidden="true" /> : <Play aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function GlobalPlayer() {
  const { currentTrack, stopPlayback } = usePlayer();
  const { position, duration } = usePlayerTimeline();
  const [queueOpen, setQueueOpen] = useState(false);
  const dock = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const hasTrack = Boolean(currentTrack);

  useLayoutEffect(() => {
    const element = dock.current;
    if (!element) return;
    const update = () => document.documentElement.style.setProperty("--player-dock-height", `${element.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--player-dock-height");
    };
  }, [hasTrack]);

  if (!currentTrack) return null;

  function openPlayer(withQueue = false) {
    setQueueOpen(withQueue);
    dialog.current?.showModal();
  }

  return (
    <>
      <section ref={dock} className="player-dock" aria-label="Player compatto">
        <div className="player-dock-grid">
          <button type="button" className="player-dock-track" onClick={() => openPlayer()}
            aria-label={`Apri player: ${currentTrack.titolo}, ${currentTrack.artista}`}
            aria-haspopup="dialog">
            <Artwork track={currentTrack} />
            <span className="player-dock-info">
              <strong>{currentTrack.titolo}</strong>
              <small>{currentTrack.artista}</small>
            </span>
            <ChevronUp aria-hidden="true" />
          </button>
          <div className="player-dock-center">
            <Transport compact />
            <SeekBar />
          </div>
          <div className="player-dock-actions">
            <button type="button" className="player-icon" aria-label="Apri coda"
              aria-haspopup="dialog" onClick={() => openPlayer(true)}><ListMusic aria-hidden="true" /></button>
            <Volume />
          </div>
        </div>
        <PlaybackStatus />
        <progress className="player-mini-progress" max={duration || 1} value={position} aria-hidden="true" />
      </section>

      <dialog ref={dialog} className="player-dialog" aria-labelledby="player-dialog-title"
        onClose={() => setQueueOpen(false)}>
        <div className="player-dialog-header">
          <button type="button" className="player-icon" aria-label="Riduci player"
            onClick={() => dialog.current?.close()}><ChevronDown aria-hidden="true" /></button>
          <h2 id="player-dialog-title">In riproduzione</h2>
          <button type="button" className="player-icon" aria-label="Ferma riproduzione" onClick={() => {
            dialog.current?.close();
            stopPlayback();
          }}><X aria-hidden="true" /></button>
        </div>
        <div className={`player-dialog-body ${queueOpen ? "player-dialog-with-queue" : ""}`}>
          <div className="player-now">
            <div className="player-now-art"><Artwork track={currentTrack} /></div>
            <div className="player-now-info">
              <h3><Link className="hover:underline focus-visible:underline" to={`/track/${encodeURIComponent(currentTrack.music_path)}`}
                onClick={() => dialog.current?.close()}>{currentTrack.titolo}</Link></h3>
              <p>{currentTrack.artista}</p>
              {currentTrack.album && <small>{currentTrack.album}</small>}
            </div>
            <SeekBar />
            <Transport />
            <div className="player-dialog-actions">
              <button type="button" className="player-icon" aria-label="Coda" aria-expanded={queueOpen}
                aria-controls={queueOpen ? "player-queue" : undefined}
                onClick={() => setQueueOpen((open) => !open)}><ListMusic aria-hidden="true" /></button>
              <Volume />
            </div>
            <PlaybackStatus />
          </div>
          {queueOpen && <Queue />}
        </div>
      </dialog>
    </>
  );
}
