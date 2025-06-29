import { getSequelizeInstance } from "./sequelize";

import User from "../models/User";
import Track from "../models/Track";
import Purchase from "../models/Purchase";
import Playlist from "../models/Playlist";
import PlaylistTrack from "../models/PlaylistTrack";
import Artist from "../models/Artist";
import TrackArtist from "../models/TrackArtist";
import Request from "../models/Request";
import RequestVote from "../models/RequestVote";
import Notification from "../models/Notification";

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

// User (1) → (N) Request
User.hasMany(Request, { foreignKey: "user_id", onDelete: "CASCADE" });
Request.belongsTo(User, { foreignKey: "user_id" });

// User (1) → (N) RequestVote
User.hasMany(RequestVote, { foreignKey: "user_id", onDelete: "CASCADE" });
RequestVote.belongsTo(User, { foreignKey: "user_id" });

// Request (1) → (N) RequestVote
Request.hasMany(RequestVote, { foreignKey: "request_id", onDelete: "CASCADE", as: "votes" });
RequestVote.belongsTo(Request, { foreignKey: "request_id" });

// User (1) → (N) Notification
User.hasMany(Notification, { foreignKey: "user_id", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });

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
  Request,
  RequestVote,
  Notification
};