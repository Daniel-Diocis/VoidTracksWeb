import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";
import User from "./User";

const sequelize = getSequelizeInstance();

/**
 * Attributi del modello `Request`, che rappresenta una richiesta di brano da parte di un utente.
 */
interface RequestAttributes {
  id: number;                              // ID univoco della richiesta
  brano: string;                           // Nome del brano richiesto
  artista: string;                         // Nome dell'artista richiesto
  user_id: number;                         // ID dell'utente che ha effettuato la richiesta
  status: "waiting" | "satisfied" | "rejected"; // Stato della richiesta
  tokens: number;                          // Token raccolti dalla community per supportare la richiesta
  createdAt?: Date;                        // Timestamp di creazione (gestito da Sequelize)
  updatedAt?: Date;                        // Timestamp di aggiornamento (gestito da Sequelize)
}

/**
 * Attributi opzionali al momento della creazione.
 * - `id`, `status`, `tokens`, `createdAt`, `updatedAt` vengono gestiti da Sequelize.
 */
interface RequestCreationAttributes
  extends Optional<RequestAttributes, "id" | "status" | "tokens" | "createdAt" | "updatedAt"> {}

/**
 * Modello Sequelize `Request`.
 *
 * - Mappa la tabella `requests` del database.
 * - Rappresenta una richiesta di aggiunta brano inviata da un utente.
 */
class Request extends Model<RequestAttributes, RequestCreationAttributes> implements RequestAttributes {
  public id!: number;
  public brano!: string;
  public artista!: string;
  public user_id!: number;
  public status!: "waiting" | "satisfied" | "rejected";
  public tokens!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inizializzazione del modello `Request`.
 *
 * - Definisce i campi, i vincoli e i tipi ENUM.
 * - Gestisce i timestamp `created_at` e `updated_at`.
 */
Request.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    brano: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    artista: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("waiting", "satisfied", "rejected"),
      allowNull: false,
      defaultValue: "waiting",
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "updated_at",
    },
  },
  {
    tableName: "requests",
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Request;