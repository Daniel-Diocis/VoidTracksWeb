import { DataTypes, Model } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";
import User from "./User";

const sequelize = getSequelizeInstance();

/**
 * Attributi del modello `Notification`, che rappresenta un messaggio destinato a un utente.
 */
interface NotificationAttributes {
  id?: number;
  user_id: number;
  message: string;
  seen: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Modello Sequelize `Notification`.
 * Tiene traccia delle notifiche temporanee per ciascun utente.
 */
class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
  public id!: number;
  public user_id!: number;
  public message!: string;
  public seen!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    seen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: true, // attiva createdAt e updatedAt
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Notification;