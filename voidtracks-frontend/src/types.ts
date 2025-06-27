/**
 * types.ts
 *
 * Definisce le interfacce TypeScript per le entità principali dell'app:
 * - Tracce musicali
 * - Playlist
 * - Acquisti
 */

/**
 * Rappresenta una traccia musicale.
 */
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

/**
 * Rappresenta una playlist creata dall’utente.
 */
export interface Playlist {
  id: number;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Associazione tra una playlist e i suoi brani.
 */
export interface PlaylistWithTracks {
  playlist: Playlist;
  tracks: Track[];
}

/**
 * Rappresenta un acquisto effettuato dall’utente, con le informazioni essenziali del brano.
 */
export interface PurchaseWithTrack {
  id: number;
  Track: {
    id: string;
    titolo: string;
    artista: string;
    album: string;
  };
}