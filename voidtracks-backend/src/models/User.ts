import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";

const sequelize = getSequelizeInstance();

/**
 * Attributi del modello `User`, che rappresenta un utente registrato.
 */
interface UserAttributes {
  id: number;                        // ID univoco dell'utente
  username: string;                 // Nome utente (univoco)
  password_hash: string;           // Hash della password
  tokens: number;                  // Numero di token posseduti
  role: "user" | "admin";          // Ruolo dell'utente
  lastTokenBonusDate?: Date | null; // Ultima data di bonus giornaliero
  createdAt?: Date;                // Timestamp di creazione (gestito da Sequelize)
  updatedAt?: Date;                // Timestamp di aggiornamento (gestito da Sequelize)
}

/**
 * Attributi opzionali alla creazione di un nuovo utente.
 * - `id`, `tokens`, `role`, `lastTokenBonusDate`, `createdAt`, `updatedAt` sono gestiti da Sequelize.
 */
interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "tokens" | "role" | "lastTokenBonusDate" | "createdAt" | "updatedAt"
  > {}

/**
 * Modello Sequelize `User`.
 *
 * Mappa la tabella `users` del database e gestisce:
 * - autenticazione (tramite `username` e `password_hash`)
 * - autorizzazione (tramite `role`)
 * - meccanismo dei token
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

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inizializzazione del modello `User` con Sequelize.
 *
 * - Imposta i vincoli sui campi (es. obbligatorietà, default, univocità)
 * - Utilizza i timestamp `created_at` e `updated_at` con alias
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