/**
 * Componente che visualizza i dettagli di una singola playlist.
 * Permette di:
 * - Rinominare la playlist
 * - Aggiungere brani acquistati ma non presenti nella playlist
 * - Rimuovere brani dalla playlist
 * - Riprodurre i brani e impostarne uno come preferito
 *
 * Props:
 * @param {number} playlistId - ID univoco della playlist da mostrare
 * @param {(id: number, nuovoNome: string) => void} onRename - Callback per rinominare la playlist
 *
 * Funzionalità:
 * - Recupera playlist e brani acquistati dall’API
 * - Gestisce lo stato di editing del nome
 * - Permette l’interazione con il PlayerContext per la riproduzione dei brani
 */

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { PlaylistWithTracks, PurchaseWithTrack } from "../types";
import { notify } from "../utils/toastManager";
import { usePlayer } from "../context/PlayerContext";
import type { Track } from "../types";

/**
 * Componente React per mostrare e modificare una playlist specifica.
 * @component
 */

export default function PlaylistDetail({
  playlistId,
  onRename,
}: {
  playlistId: number;
  onRename: (id: number, nuovoNome: string) => void;
}) {
  const { token } = useAuth();
  const [playlist, setPlaylist] = useState<PlaylistWithTracks | null>(null);
  const [purchasedTracks, setPurchasedTracks] = useState<PurchaseWithTrack[]>(
    []
  );
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    //playNext,
    //playPrevious,
    //tracks,
    setTracks,
    setIsPlaying
  } = usePlayer();

  // Gestisce la riproduzione o pausa del brano selezionato
  const handlePlayPause = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  // Carica la playlist e gli acquisti dell'utente al montaggio
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [playlistRes, purchasesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/purchase`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const playlistData = await playlistRes.json();
        const purchasesData = await purchasesRes.json();

        if (!playlistRes.ok) {
          notify.error(
            playlistData.error || "Errore nel caricamento della playlist"
          );
          return;
        }
        if (!purchasesRes.ok) {
          notify.error(
            purchasesData.error || "Errore nel caricamento degli acquisti"
          );
          return;
        }

        playlistData.tracks ??= [];
        setPlaylist(playlistData);
        setNewName(playlistData.playlist.nome);
        setTracks(playlistData.tracks);
        setPurchasedTracks(purchasesData.data || []);
      } catch (err) {
        console.error("Errore fetch playlist:", err);
        notify.error("Errore di rete durante il caricamento");
      }
    };

    fetchData();
  }, [token, playlistId]);

  // Invia la richiesta di rinomina
  const handleRename = async () => {
    if (!newName.trim()) return;
    await onRename(playlistId, newName.trim());
    setEditing(false);
  };

  // Aggiorna i dati della playlist dopo modifiche
  const refreshPlaylist = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/playlists/${playlistId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (!res.ok) {
        notify.error(data.error || "Errore aggiornamento playlist");
        return;
      }

      data.tracks ??= [];
      setPlaylist(data);
      setTracks(data.tracks);
    } catch (err) {
      console.error("Errore refresh playlist:", err);
      notify.error("Errore di rete durante il refresh");
    }
  };

  // Aggiunge un brano alla playlist
  const handleAddTrack = async (trackId: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/playlists/${playlistId}/tracks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ track_id: trackId }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        notify.error(data.error || "Errore aggiunta brano");
        return;
      }
      notify.success("Brano aggiunto con successo!");
      refreshPlaylist();
    } catch (err) {
      console.error("Errore aggiunta brano:", err);
      notify.error("Errore aggiunta brano");
    }
  };

  // Rimuove un brano dalla playlist
  const handleRemoveTrack = async (trackId: string) => {
    if (!window.confirm("Rimuovere questo brano?")) return;
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/playlists/${playlistId}/tracks/${trackId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        notify.error(data.error || "Errore rimozione brano");
        return;
      }
      notify.success("Brano rimosso con successo!");
      refreshPlaylist();
    } catch (err) {
      console.error("Errore rimozione brano:", err);
      notify.error("Errore rimozione brano");
    }
  };

  // Imposta un brano come preferito nella playlist
  const handleSetFavorite = async (trackId: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/playlists/${playlistId}/favorite`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ trackId }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        notify.error(data.error || "Errore impostazione preferito");
        return;
      }
      notify.success("Brano impostato come preferito!");
      refreshPlaylist();
    } catch (err) {
      console.error("Errore impostazione preferito:", err);
      notify.error("Errore impostazione preferito");
    }
  };

  if (!playlist) return <div className="panel">Caricamento...</div>;

  return (
    <div className="panel w-full md:w-2/3">
      <div className="flex items-center justify-between mb-2">
        {editing ? (
          <div className="flex gap-2 w-full">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename();
              }}
              className="flex-1"
            />
            <button onClick={handleRename} className="text-green-400">
              ✔
            </button>
            <button onClick={() => setEditing(false)} className="text-gray-400">
              ✖
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">{playlist.playlist.nome}</h2>
            <button
              onClick={() => setEditing(true)}
              className="text-blue-400 text-sm"
            >
              ✏️ Rinomina
            </button>
          </>
        )}
      </div>

      <h3 className="font-semibold mt-4 mb-2">
        Brani acquistati non nella playlist:
      </h3>
      <ul className="bg-zinc-800 p-2 rounded border border-zinc-700 mb-4">
        {purchasedTracks
          .filter(
            (p) => p.Track && !playlist.tracks.some((t) => t.id === p.Track.id)
          )
          .map((p) => (
            <li
              key={p.Track!.id}
              className="flex justify-between items-center py-2 border-b border-zinc-700 last:border-b-0"
            >
              <div>
                <div className="font-medium">{p.Track!.titolo}</div>
                <div className="text-sm text-gray-400">
                  {p.Track!.artista} – {p.Track!.album}
                </div>
              </div>
              <button
                onClick={() => handleAddTrack(p.Track!.id)}
                className="market-buy"
              >
                ➕ Aggiungi
              </button>
            </li>
          ))}
        {purchasedTracks.filter(
          (p) => p.Track && !playlist.tracks.some((t) => t.id === p.Track.id)
        ).length === 0 && (
          <li className="text-gray-500 italic p-2">
            Nessun brano disponibile da aggiungere.
          </li>
        )}
      </ul>

      <h3 className="font-semibold mb-2">Brani nella playlist:</h3>
      <ul>
        {playlist.tracks.length > 0 ? (
          playlist.tracks.map((track) => (
            <li
              key={track.id}
              className="flex justify-between items-center p-2 border-b border-zinc-700"
            >
              <div>
                <div className="font-medium">{track.titolo}</div>
                <div className="text-sm text-gray-400">
                  {track.artista} – {track.album}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {track.is_favorite && (
                  <span className="text-yellow-400 font-bold">★</span>
                )}
                {currentTrack?.id === track.id && isPlaying ? (
                  <button
                    onClick={() => setIsPlaying(false)}
                    title="Pausa"
                    className="text-green-400 hover:text-green-500"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlayPause(track)}
                    title="Riproduci"
                    className="text-green-400 hover:text-green-500"
                  >
                    Play
                  </button>
                )}
                {track.is_favorite ? (
                  <span className="text-yellow-400 font-bold">★</span>
                ) : (
                  <button
                    onClick={() => handleSetFavorite(track.id)}
                    title="Imposta come preferito"
                    className="text-yellow-400 hover:text-yellow-500"
                  >
                    ⭐
                  </button>
                )}
                <button
                  onClick={() => handleRemoveTrack(track.id)}
                  title="Rimuovi"
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-500 italic p-2">
            Nessun brano nella playlist.
          </li>
        )}
      </ul>
    </div>
  );
}
