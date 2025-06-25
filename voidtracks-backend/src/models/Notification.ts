import { DataTypes, Model } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";
import User from "./User";

const sequelize = getSequelizeInstance();

/**
 * Attributi del modello `Notification`, che rappresenta un messaggio destinato a un utente.
 */
interface NotificationAttributes {
  id?: number;           // ID univoco della notifica (autoincrementato)
  user_id: number;       // ID dell'utente destinatario
  message: string;       // Contenuto testuale della notifica
  seen: boolean;         // Indica se la notifica è stata letta
  createdAt?: Date;      // Timestamp di creazione (gestito da Sequelize)
  updatedAt?: Date;      // Timestamp di aggiornamento (gestito da Sequelize)
}

/**
 * Modello Sequelize `Notification`.
 *
 * - Mappa la tabella `notifications`.
 * - Tiene traccia delle notifiche associate agli utenti.
 */
class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
  public id!: number;
  public user_id!: number;
  public message!: string;
  public seen!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inizializzazione del modello `Notification`.
 *
 * - Definisce i campi della tabella e i vincoli.
 * - Gestisce i timestamp `created_at` e `updated_at`.
 */
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
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Notification;