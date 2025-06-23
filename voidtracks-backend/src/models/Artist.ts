import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/sequelize";

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
 * Attributi opzionali per la creazione di un artista.
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
 * Rappresenta un artista musicale che può essere collegato a uno o più `Track`.
 * Gli artisti possono essere sincronizzati da Supabase e avere dati come
 * biografia, genere, paese e immagine del profilo.
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