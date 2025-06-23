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
 * Attributi del modello `Track`.
 */
interface TrackAttributes {
  id: string;
  titolo: string;
  artista: string;
  album: string;
  music_path: string;
  cover_path: string;
  costo: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Attributi opzionali alla creazione di un nuovo brano.
 * `id`, `createdAt` e `updatedAt` saranno gestiti da Sequelize.
 */
interface TrackCreationAttributes
  extends Optional<TrackAttributes, "id" | "createdAt" | "updatedAt"> {}

/**
 * Modello Sequelize per rappresentare un brano musicale.
 *
 * - Estende `Model` di Sequelize con tipi forti.
 * - Include metodi per gestire le associazioni con `Artist` (many-to-many).
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
   * Sostituisce gli artisti associati al brano.
   * Metodo generato da `belongsToMany`.
   */
  public setArtists!: BelongsToManySetAssociationsMixin<Artist, string>;

  /**
   * Aggiunge nuovi artisti alla lista associata al brano.
   * Metodo generato da `belongsToMany`.
   */
  public addArtists!: BelongsToManyAddAssociationsMixin<Artist, string>;
}

/**
 * Inizializzazione del modello `Track` con Sequelize.
 *
 * - Definisce i campi della tabella `tracks`.
 * - Gestisce i timestamp `created_at` e `updated_at`.
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