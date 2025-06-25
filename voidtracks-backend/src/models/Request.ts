import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";
import User from "./User";

const sequelize = getSequelizeInstance();

/**
 * Attributi del modello `Request`, che rappresenta una richiesta di brano da parte di un utente.
 */
interface RequestAttributes {
  id: number;
  brano: string;
  artista: string;
  user_id: number;
  status: "waiting" | "satisfied" | "rejected";
  tokens: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RequestCreationAttributes
  extends Optional<RequestAttributes, "id" | "status" | "tokens" | "createdAt" | "updatedAt"> {}

/**
 * Modello Sequelize `Request`.
 * Rappresenta una richiesta di aggiunta brano inviata da un utente.
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