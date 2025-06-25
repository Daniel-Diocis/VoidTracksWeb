import { DataTypes, Model } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";
import User from "./User";
import Request from "./Request";

const sequelize = getSequelizeInstance();

/**
 * Attributi del modello `RequestVote`.
 * Rappresenta un voto espresso da un utente su una richiesta di brano.
 */
interface RequestVoteAttributes {
  user_id: number;      // ID dell'utente votante
  request_id: number;   // ID della richiesta votata
}

/**
 * Modello Sequelize `RequestVote`.
 *
 * - Mappa la tabella `request_votes` del database.
 * - Tiene traccia dei voti degli utenti su richieste specifiche.
 * - Utilizza una chiave primaria composta da `user_id` e `request_id`.
 */
class RequestVote extends Model<RequestVoteAttributes> implements RequestVoteAttributes {
  public user_id!: number;
  public request_id!: number;
}

/**
 * Inizializzazione del modello `RequestVote`.
 *
 * - Definisce i due campi della chiave primaria composta.
 * - Nessun timestamp viene registrato.
 */
RequestVote.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: "request_votes",
    sequelize,
    timestamps: false,
  }
);

export default RequestVote;