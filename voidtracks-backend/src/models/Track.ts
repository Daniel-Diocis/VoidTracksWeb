import {
  DataTypes,
  Model,
  Optional,
  BelongsToManyAddAssociationsMixin,
  BelongsToManySetAssociationsMixin
} from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";
import Artist from "./Artist";

const sequelize = getSequelizeInstance();

/**
 * Attributi del modello `Track`, che rappresenta un brano musicale.
 */
interface TrackAttributes {
  id: string;            // ID univoco del brano
  titolo: string;        // Titolo del brano
  artista: string;       // Nome dell’artista principale (stringa)
  album: string;         // Nome dell’album
  music_path: string;    // Percorso del file audio
  cover_path: string;    // Percorso dell’immagine di copertina
  costo: number;         // Costo del brano in token
  createdAt?: Date;      // Timestamp di creazione
  updatedAt?: Date;      // Timestamp di aggiornamento
}

/**
 * Attributi opzionali alla creazione di un nuovo brano.
 * - `id`, `createdAt` e `updatedAt` sono gestiti da Sequelize.
 */
interface TrackCreationAttributes
  extends Optional<TrackAttributes, "id" | "createdAt" | "updatedAt"> {}

/**
 * Modello Sequelize `Track`.
 *
 * - Mappa la tabella `tracks` del database.
 * - Include campi come titolo, artista, album, costo e percorsi file.
 * - Supporta le associazioni many-to-many con il modello `Artist`.
 */
class Track
  extends Model<TrackAttributes, TrackCreationAttributes>
  implements TrackAttributes
{
  public id!: string;
  public titolo!: string;
  public artista!: string;
  public album!: string;
  public music_path!: string;
  public cover_path!: string;
  public costo!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * Associa una lista di artisti al brano (sovrascrive eventuali associazioni).
   */
  public setArtists!: BelongsToManySetAssociationsMixin<Artist, string>;

  /**
   * Aggiunge uno o più artisti al brano senza rimuovere quelli esistenti.
   */
  public addArtists!: BelongsToManyAddAssociationsMixin<Artist, string>;
}

/**
 * Inizializzazione del modello `Track` con Sequelize.
 *
 * - Imposta campi, vincoli e mapping per `created_at` e `updated_at`.
 */
Track.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    titolo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    artista: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    album: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    music_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cover_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    costo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    tableName: "tracks",
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Track;