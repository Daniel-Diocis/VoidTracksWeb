export interface Track {
  id: string;
  titolo: string;
  artista: string;
  album: string;
  cover_path: string;
  music_path: string;
  updated_at: string;
  costo: number;
  is_favorite?: boolean;   // opzionale, solo nelle playlist
  isUpdated?: boolean;     // campo interno calcolato localmente
}

export interface Playlist {
  id: number;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistWithTracks {
  playlist: Playlist;
  tracks: Track[];
}

export interface PurchaseWithTrack {
  id: number;
  Track: {
    id: string;
    titolo: string;
    artista: string;
    album: string;
  };
}