import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/sequelize';

interface PlaylistTrackAttributes {
  id: number;
  playlist_id: number;
  track_id: number;
  is_favorite: boolean;
}

interface PlaylistTrackCreationAttributes extends Optional<PlaylistTrackAttributes, 'id' | 'is_favorite'> {}

class PlaylistTrack extends Model<PlaylistTrackAttributes, PlaylistTrackCreationAttributes> implements PlaylistTrackAttributes {
  public id!: number;
  public playlist_id!: number;
  public track_id!: number;
  public is_favorite!: boolean;
}

PlaylistTrack.init(
  {
    id: {
      type: DataTypes.INTEGER,  // PostgreSQL non supporta UNSIGNED
      autoIncrement: true,
      primaryKey: true,
    },
    playlist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'playlists', key: 'id' },
      onDelete: 'CASCADE',
    },
    track_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'tracks', key: 'id' },
      onDelete: 'CASCADE',
    },
    is_favorite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'playlist_tracks',
    sequelize,
    timestamps: false, // Disabilita createdAt e updatedAt
  }
);

export default PlaylistTrack;