"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackArtist = exports.Artist = exports.PlaylistTrack = exports.Playlist = exports.Purchase = exports.Track = exports.User = exports.sequelize = void 0;
const sequelize_1 = require("./sequelize");
const User_1 = __importDefault(require("../models/User"));
exports.User = User_1.default;
const Track_1 = __importDefault(require("../models/Track"));
exports.Track = Track_1.default;
const Purchase_1 = __importDefault(require("../models/Purchase"));
exports.Purchase = Purchase_1.default;
const Playlist_1 = __importDefault(require("../models/Playlist"));
exports.Playlist = Playlist_1.default;
const PlaylistTrack_1 = __importDefault(require("../models/PlaylistTrack"));
exports.PlaylistTrack = PlaylistTrack_1.default;
const Artist_1 = __importDefault(require("../models/Artist"));
exports.Artist = Artist_1.default;
const TrackArtist_1 = __importDefault(require("../models/TrackArtist"));
exports.TrackArtist = TrackArtist_1.default;
const sequelize = (0, sequelize_1.getSequelizeInstance)();
exports.sequelize = sequelize;
/**
 * Definizione delle associazioni tra i modelli Sequelize.
 *
 * - Un utente può effettuare più acquisti e possedere più playlist.
 * - Ogni acquisto è collegato a un utente e a un brano.
 * - Ogni playlist può contenere più brani tramite la tabella intermedia `PlaylistTrack`.
 * - Ogni brano può essere associato a più artisti e viceversa tramite la tabella `TrackArtist`.
 */
// User (1) → (N) Purchase
User_1.default.hasMany(Purchase_1.default, { foreignKey: "user_id" });
Purchase_1.default.belongsTo(User_1.default, { foreignKey: "user_id" });
// Track (1) → (N) Purchase
Track_1.default.hasMany(Purchase_1.default, { foreignKey: "track_id" });
Purchase_1.default.belongsTo(Track_1.default, { foreignKey: "track_id" });
// User (1) → (N) Playlist
User_1.default.hasMany(Playlist_1.default, { foreignKey: "user_id" });
Playlist_1.default.belongsTo(User_1.default, { foreignKey: "user_id" });
// Playlist (1) → (N) PlaylistTrack
Playlist_1.default.hasMany(PlaylistTrack_1.default, { foreignKey: "playlist_id" });
PlaylistTrack_1.default.belongsTo(Playlist_1.default, { foreignKey: "playlist_id" });
// Track (1) → (N) PlaylistTrack
Track_1.default.hasMany(PlaylistTrack_1.default, { foreignKey: "track_id" });
PlaylistTrack_1.default.belongsTo(Track_1.default, { foreignKey: "track_id" });
// Track (N) ↔ (N) Artist tramite TrackArtist
Track_1.default.belongsToMany(Artist_1.default, {
    through: TrackArtist_1.default,
    foreignKey: "track_id",
    otherKey: "artist_id",
});
Artist_1.default.belongsToMany(Track_1.default, {
    through: TrackArtist_1.default,
    foreignKey: "artist_id",
    otherKey: "track_id",
});
