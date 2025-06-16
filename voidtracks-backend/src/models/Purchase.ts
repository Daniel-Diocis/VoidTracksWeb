import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/sequelize';
import User from './User';
import Track from './Track';

interface PurchaseAttributes {
  id: string;              // UUID
  user_id: number;
  track_id: string;        // UUID
  purchased_at?: Date;
  valid_until: Date;
  used_flag: boolean;
  costo: number;
  download_token: string;  // UUID per link download
}

interface PurchaseCreationAttributes extends Optional<PurchaseAttributes, 'id' | 'purchased_at' | 'used_flag' | 'download_token'> {}

class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes> implements PurchaseAttributes {
  public id!: string;
  public user_id!: number;
  public track_id!: string;
  public purchased_at!: Date;
  public valid_until!: Date;
  public used_flag!: boolean;
  public costo!: number;
  public download_token!: string;

  public readonly User?: User;
  public readonly Track?: Track;
}

Purchase.init(
  {
    id: {
      type: DataTypes.UUID,          // UUID come PK
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    track_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'tracks', key: 'id' },
      onDelete: 'CASCADE',
    },
    purchased_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    costo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    download_token: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
  },
  {
    tableName: 'purchases',
    sequelize,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'track_id'],
      },
      {
        unique: true,
        fields: ['download_token'],
      }
    ],
  }
);

Purchase.belongsTo(User, { foreignKey: 'user_id' });
Purchase.belongsTo(Track, { foreignKey: 'track_id' });

export default Purchase;