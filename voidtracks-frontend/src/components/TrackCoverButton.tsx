import { Pause, Play } from "lucide-react";
import type { PlayableTrack } from "../types";
import { mediaUrl } from "../utils/mediaUrl";

type Props = {
  track: PlayableTrack;
  playing: boolean;
  onToggle: () => void;
};

export default function TrackCoverButton({ track, playing, onToggle }: Props) {
  const Icon = playing ? Pause : Play;
  return (
    <button type="button" className="track-cover-button" onClick={onToggle}
      aria-label={`${playing ? "Metti in pausa" : "Riproduci"} ${track.titolo}`}>
      <img src={mediaUrl(import.meta.env.VITE_COVER_URL, track.cover_path)} alt="" />
      <span className="track-cover-action" data-playing={playing}>
        <Icon aria-hidden="true" size={18} fill="currentColor" />
      </span>
    </button>
  );
}
