import sequelize from './sequelize';
import User from '../models/User';
import Track from '../models/Track';
import Purchase from '../models/Purchase';
import Playlist from '../models/Playlist';
import PlaylistTrack from '../models/PlaylistTrack';

// Associazioni tra modelli
User.hasMany(Purchase, { foreignKey: 'user_id' });
Purchase.belongsTo(User, { foreignKey: 'user_id' });

Track.hasMany(Purchase, { foreignKey: 'track_id' });
Purchase.belongsTo(Track, { foreignKey: 'track_id' });

User.hasMany(Playlist, { foreignKey: 'user_id' });
Playlist.belongsTo(User, { foreignKey: 'user_id' });

Playlist.hasMany(PlaylistTrack, { foreignKey: 'playlist_id' });
PlaylistTrack.belongsTo(Playlist, { foreignKey: 'playlist_id' });

Track.hasMany(PlaylistTrack, { foreignKey: 'track_id' });
PlaylistTrack.belongsTo(Track, { foreignKey: 'track_id' });

export {
  sequelize,
  User,
  Track,
  Purchase,
  Playlist,
  PlaylistTrack,
};