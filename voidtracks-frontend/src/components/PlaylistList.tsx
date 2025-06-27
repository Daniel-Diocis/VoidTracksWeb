/**
 * PlaylistList.tsx
 *
 * Componente che mostra l'elenco delle playlist dell'utente.
 * Permette:
 * - Selezione di una playlist
 * - Eliminazione di una playlist
 *
 * Props:
 * @param {Playlist[]} playlists - Lista di playlist da visualizzare
 * @param {number | null} selectedId - ID della playlist attualmente selezionata
 * @param {(id: number) => void} onSelect - Callback chiamata quando una playlist viene selezionata
 * @param {(id: number) => void} onDelete - Callback chiamata quando una playlist viene eliminata
 */

import type { Playlist } from '../types';

/**
 * Componente React per visualizzare una lista di playlist.
 * Evidenzia la playlist selezionata e consente la rimozione con un pulsante.
 * @component
 */
interface Props {
  playlists: Playlist[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function PlaylistList({ playlists, selectedId, onSelect, onDelete }: Props) {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-3">Le tue Playlist</h2>
      <ul>
        {playlists.map(pl => (
          <li
            key={pl.id}
            className={`flex justify-between items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${
              selectedId === pl.id ? 'bg-gray-200 text-black' : ''
            }`}
          >
            {/* Cliccando sul nome della playlist la si seleziona */}
            <div onClick={() => onSelect(pl.id)} className="flex-1">
              🎵 {pl.nome}
            </div>

            {/* Pulsante per eliminare la playlist */}
            <button
              onClick={() => onDelete(pl.id)}
              className="ml-2 text-red-500 hover:text-red-700"
              title="Elimina playlist"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}