import { getSequelizeInstance } from "./sequelize";

import User from "../models/User";
import Track from "../models/Track";
import Purchase from "../models/Purchase";
import Playlist from "../models/Playlist";
import PlaylistTrack from "../models/PlaylistTrack";
import Artist from "../models/Artist";
import TrackArtist from "../models/TrackArtist";

const sequelize = getSequelizeInstance();

/**
 * Definizione delle associazioni tra i modelli Sequelize.
 *
 * - Un utente può effettuare più acquisti e possedere più playlist.
 * - Ogni acquisto è collegato a un utente e a un brano.
 * - Ogni playlist può contenere più brani tramite la tabella intermedia `PlaylistTrack`.
 * - Ogni brano può essere associato a più artisti e viceversa tramite la tabella `TrackArtist`.
 */

// User (1) → (N) Purchase
User.hasMany(Purchase, { foreignKey: "user_id" });
Purchase.belongsTo(User, { foreignKey: "user_id" });

// Track (1) → (N) Purchase
Track.hasMany(Purchase, { foreignKey: "track_id" });
Purchase.belongsTo(Track, { foreignKey: "track_id" });

// User (1) → (N) Playlist
User.hasMany(Playlist, { foreignKey: "user_id" });
Playlist.belongsTo(User, { foreignKey: "user_id" });

// Playlist (1) → (N) PlaylistTrack
Playlist.hasMany(PlaylistTrack, { foreignKey: "playlist_id" });
PlaylistTrack.belongsTo(Playlist, { foreignKey: "playlist_id" });

// Track (1) → (N) PlaylistTrack
Track.hasMany(PlaylistTrack, { foreignKey: "track_id" });
PlaylistTrack.belongsTo(Track, { foreignKey: "track_id" });

// Track (N) ↔ (N) Artist tramite TrackArtist
Track.belongsToMany(Artist, {
  through: TrackArtist,
  foreignKey: "track_id",
  otherKey: "artist_id",
});
Artist.belongsToMany(Track, {
  through: TrackArtist,
  foreignKey: "artist_id",
  otherKey: "track_id",
});

/**
 * Esporta l'istanza Sequelize e i modelli associati.
 */
export {
  sequelize,
  User,
  Track,
  Purchase,
  Playlist,
  PlaylistTrack,
  Artist,
  TrackArtist,
};