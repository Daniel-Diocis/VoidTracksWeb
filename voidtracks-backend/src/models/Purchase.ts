import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/sequelize';

interface PurchaseAttributes {
  id: number;
  user_id: number;
  track_id: number;
  purchased_at?: Date;
}

interface PurchaseCreationAttributes extends Optional<PurchaseAttributes, 'id' | 'purchased_at'> {}

class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes> implements PurchaseAttributes {
  public id!: number;
  public user_id!: number;
  public track_id!: number;
  public purchased_at!: Date;
}

Purchase.init(
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
    track_id: {
      type: DataTypes.INTEGER,  // senza UNSIGNED
      allowNull: false,
      references: { model: 'tracks', key: 'id' },
      onDelete: 'CASCADE',
    },
    purchased_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'purchases',
    sequelize,
    timestamps: false, // usi purchased_at al posto dei created/updatedAt
  }
);

export default Purchase;