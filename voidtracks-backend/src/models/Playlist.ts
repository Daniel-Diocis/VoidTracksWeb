import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/sequelize";

/**
 * Attributi del modello `Playlist`.
 */
interface PlaylistAttributes {
  id: number;           // ID univoco della playlist
  user_id: number;      // ID dell’utente proprietario
  nome: string;         // Nome della playlist
  createdAt?: Date;     // Timestamp di creazione
  updatedAt?: Date;     // Timestamp di aggiornamento
}

/**
 * Attributi opzionali alla creazione di una nuova playlist.
 * - `id`, `createdAt` e `updatedAt` sono gestiti automaticamente da Sequelize.
 */
interface PlaylistCreationAttributes
  extends Optional<PlaylistAttributes, "id" | "createdAt" | "updatedAt"> {}

/**
 * Modello Sequelize che rappresenta una playlist creata da un utente.
 *
 * - Estende `Model` con tipizzazione forte.
 * - Ogni playlist è associata a un utente tramite `user_id`.
 */
class Playlist
  extends Model<PlaylistAttributes, PlaylistCreationAttributes>
  implements PlaylistAttributes
{
  public id!: number;
  public user_id!: number;
  public nome!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inizializzazione del modello `Playlist` con Sequelize.
 *
 * - Mappa i campi della tabella `playlists`.
 * - Include chiave esterna verso `users`.
 * - Abilita i timestamp `createdAt` e `updatedAt`.
 */
Playlist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "playlists",
    sequelize,
    timestamps: true,
  }
);

export default Playlist;