import type { Playlist } from '../types';

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
            <div onClick={() => onSelect(pl.id)} className="flex-1">
              🎵 {pl.nome}
            </div>
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