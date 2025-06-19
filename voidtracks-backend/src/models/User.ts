import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/sequelize";

// Interfaccia che definisce gli attributi del modello User
interface UserAttributes {
  id: number;
  username: string;
  password_hash: string;
  tokens: number;
  role: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaccia per creazione User, rende opzionali alcuni campi come id, tokens, role, createdAt, updatedAt
interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "tokens" | "role" | "createdAt" | "updatedAt"
  > {}

// Classe modello User estesa da Sequelize Model con tipi definiti
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public password_hash!: string;
  public tokens!: number;
  public role!: "user" | "admin";

  // Timestamp gestiti automaticamente da Sequelize, solo lettura
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inizializzazione del modello Sequelize con le colonne e tipi dati associati
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    role: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "user",
    },
  },
  {
    tableName: "users", // nome tabella nel DB
    sequelize, // istanza Sequelize
    timestamps: true, // abilita createdAt e updatedAt
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;