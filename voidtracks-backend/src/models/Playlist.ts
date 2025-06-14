import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/sequelize';

interface PlaylistAttributes {
  id: number;
  user_id: number;
  nome: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlaylistCreationAttributes extends Optional<PlaylistAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Playlist extends Model<PlaylistAttributes, PlaylistCreationAttributes> implements PlaylistAttributes {
  public id!: number;
  public user_id!: number;
  public nome!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Playlist.init(
  {
    id: {
      type: DataTypes.INTEGER,  // senza UNSIGNED
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,  // senza UNSIGNED
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    nome: {
      type: DataTypes.STRING(100),  // forma comune senza new
      allowNull: false,
    },
  },
  {
    tableName: 'playlists',
    sequelize,
    timestamps: true, // abilita createdAt e updatedAt automatici
  }
);

export default Playlist;