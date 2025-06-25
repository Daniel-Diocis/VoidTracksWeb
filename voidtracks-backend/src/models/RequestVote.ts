import { DataTypes, Model } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";
import User from "./User";
import Request from "./Request";

const sequelize = getSequelizeInstance();

/**
 * Attributi del modello `RequestVote`, che rappresenta un voto di un utente su una richiesta.
 */
interface RequestVoteAttributes {
  user_id: number;
  request_id: number;
}

/**
 * Modello Sequelize `RequestVote`.
 * Tiene traccia dei voti espressi dagli utenti sulle richieste di brani.
 */
class RequestVote extends Model<RequestVoteAttributes> implements RequestVoteAttributes {
  public user_id!: number;
  public request_id!: number;
}

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