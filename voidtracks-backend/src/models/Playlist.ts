import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";

const sequelize = getSequelizeInstance();

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
 * - `id`, `createdAt` e `updatedAt` sono gestiti da Sequelize.
 */
interface PlaylistCreationAttributes
  extends Optional<PlaylistAttributes, "id" | "createdAt" | "updatedAt"> {}

/**
 * Modello Sequelize `Playlist`.
 *
 * Rappresenta una playlist personalizzata creata da un utente del sistema.
 * Ogni playlist è identificata da un nome ed è associata a un utente (`user_id`).
 *
 * La playlist può contenere più brani, gestiti tramite la tabella ponte `PlaylistTrack`.
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