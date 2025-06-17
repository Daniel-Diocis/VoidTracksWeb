export interface Track {
  id: string;
  titolo: string;
  artista: string;
  album: string;
  cover_path: string;
  is_favorite: boolean;
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