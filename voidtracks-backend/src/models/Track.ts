import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/sequelize';

interface TrackAttributes {
  id: string;  // cambia a stringa per UUID
  titolo: string;
  artista: string;
  album: string;
  music_path: string;
  cover_path: string;
  costo: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TrackCreationAttributes extends Optional<TrackAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Track extends Model<TrackAttributes, TrackCreationAttributes> implements TrackAttributes {
  public id!: string;
  public titolo!: string;
  public artista!: string;
  public album!: string;
  public music_path!: string;
  public cover_path!: string;
  public costo!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Track.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    titolo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    artista: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    album: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    music_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cover_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    costo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at',
    },
  },
  {
    tableName: 'tracks',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Track;