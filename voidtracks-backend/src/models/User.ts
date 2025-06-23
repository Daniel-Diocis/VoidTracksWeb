import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/sequelize";

/**
 * Attributi definiti per il modello `User`.
 */
interface UserAttributes {
  id: number;
  username: string;
  password_hash: string;
  tokens: number;
  role: "user" | "admin";
  lastTokenBonusDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Attributi richiesti al momento della creazione di un nuovo utente.
 * Rende opzionali `id`, `tokens`, `role`, `lastTokenBonusDate`, `createdAt`, `updatedAt`,
 * che verranno gestiti automaticamente da Sequelize.
 */
interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "tokens" | "role" | "lastTokenBonusDate" | "createdAt" | "updatedAt"
  > {}

/**
 * Modello Sequelize che rappresenta la tabella `users`.
 *
 * - Estende `Model` di Sequelize.
 * - Implementa l'interfaccia `UserAttributes` per tipizzazione forte.
 */
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public password_hash!: string;
  public tokens!: number;
  public role!: "user" | "admin";
  public lastTokenBonusDate?: Date | null;

  // Timestamp generati automaticamente da Sequelize
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inizializzazione del modello `User` con Sequelize.
 *
 * - Mappa gli attributi sul database.
 * - Imposta vincoli come `allowNull`, `defaultValue` e `unique`.
 * - Abilita i timestamp `created_at` e `updated_at`.
 */
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
    lastTokenBonusDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "last_token_bonus_date",
    },
  },
  {
    tableName: "users",
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;