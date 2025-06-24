import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";

const sequelize = getSequelizeInstance();

/**
 * Attributi del modello `Artist`, che rappresenta un artista musicale.
 */
interface ArtistAttributes {
  id: string;                   // UUID dell'artista
  nome: string;                 // Nome dell'artista
  genere?: string;              // Genere musicale (es. Hip-Hop, Pop)
  paese?: string;               // Paese di provenienza
  descrizione?: string;         // Breve biografia o nota descrittiva
  profile_path?: string;        // Percorso all'immagine del profilo
  createdAt?: Date;             // Timestamp di creazione (gestito da Sequelize)
  updatedAt?: Date;             // Timestamp di aggiornamento (gestito da Sequelize)
}

/**
 * Attributi opzionali alla creazione di un nuovo artista.
 * - `id`, `genere`, `paese`, `descrizione`, `profilePath` `createdAt`, `updatedAt` sono gestiti da Sequelize.
 */
interface ArtistCreationAttributes
  extends Optional<
    ArtistAttributes,
    | "id"
    | "genere"
    | "paese"
    | "descrizione"
    | "profile_path"
    | "createdAt"
    | "updatedAt"
  > {}

/**
 * Modello Sequelize `Artist`.
 *
 * Rappresenta un artista musicale memorizzato nel sistema.
 * Ogni artista può essere associato a uno o più brani (`Track`) tramite relazione N:N.
 *
 * Gli artisti possono includere:
 * - Nome, genere musicale e paese di origine
 * - Descrizione testuale (biografia)
 * - Immagine del profilo (path)
 *
 * I dati possono essere sincronizzati da una sorgente esterna come Supabase.
 */
class Artist
  extends Model<ArtistAttributes, ArtistCreationAttributes>
  implements ArtistAttributes
{
  public id!: string;
  public nome!: string;
  public genere?: string;
  public paese?: string;
  public descrizione?: string;
  public profile_path?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

/**
 * Inizializzazione del modello `Artist` con Sequelize.
 */
Artist.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    genere: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    paese: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    descrizione: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profile_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tableName: "artists",
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Artist;