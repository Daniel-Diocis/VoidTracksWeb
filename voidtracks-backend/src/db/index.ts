import sequelize from "./sequelize";
import User from "../models/User";
import Track from "../models/Track";
import Purchase from "../models/Purchase";
import Playlist from "../models/Playlist";
import PlaylistTrack from "../models/PlaylistTrack";
import Artist from "../models/Artist";
import TrackArtist from "../models/TrackArtist";

// Associazioni tra modelli
User.hasMany(Purchase, { foreignKey: "user_id" });
Purchase.belongsTo(User, { foreignKey: "user_id" });

Track.hasMany(Purchase, { foreignKey: "track_id" });
Purchase.belongsTo(Track, { foreignKey: "track_id" });

User.hasMany(Playlist, { foreignKey: "user_id" });
Playlist.belongsTo(User, { foreignKey: "user_id" });

Playlist.hasMany(PlaylistTrack, { foreignKey: "playlist_id" });
PlaylistTrack.belongsTo(Playlist, { foreignKey: "playlist_id" });

Track.hasMany(PlaylistTrack, { foreignKey: "track_id" });
PlaylistTrack.belongsTo(Track, { foreignKey: "track_id" });

Track.belongsToMany(Artist, { through: TrackArtist, foreignKey: 'track_id', otherKey: 'artist_id' });
Artist.belongsToMany(Track, { through: TrackArtist, foreignKey: 'artist_id', otherKey: 'track_id' });

export { sequelize, User, Track, Purchase, Playlist, PlaylistTrack, Artist, TrackArtist };
