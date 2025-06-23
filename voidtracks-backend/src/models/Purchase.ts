import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";
import User from "./User";
import Track from "./Track";

const sequelize = getSequelizeInstance();

/**
 * Attributi della tabella `purchases`.
 */
interface PurchaseAttributes {
  id: string; // UUID della transazione
  user_id: number; // riferimento all’utente acquirente
  track_id: string; // riferimento al brano acquistato
  purchased_at?: Date; // timestamp dell'acquisto
  valid_until: Date; // data di scadenza per il download
  used_flag: boolean; // indica se il download è già stato effettuato
  costo: number; // costo in token
  download_token: string; // token univoco per il download
}

/**
 * Attributi opzionali alla creazione di una nuova `Purchase`.
 * - `id`, `purchased_at`, `used_flag` e `download_token` sono generati automaticamente.
 */
interface PurchaseCreationAttributes
  extends Optional<
    PurchaseAttributes,
    "id" | "purchased_at" | "used_flag" | "download_token"
  > {}

/**
 * Modello Sequelize per rappresentare un acquisto di un brano da parte di un utente.
 *
 * - Include riferimenti alle entità `User` e `Track`.
 * - Ogni riga rappresenta un download autorizzato e limitato nel tempo.
 */
class Purchase
  extends Model<PurchaseAttributes, PurchaseCreationAttributes>
  implements PurchaseAttributes
{
  public id!: string;
  public user_id!: number;
  public track_id!: string;
  public purchased_at!: Date;
  public valid_until!: Date;
  public used_flag!: boolean;
  public costo!: number;
  public download_token!: string;

  /**
   * Associazione opzionale con il modello `User`.
   */
  public readonly User?: User;

  /**
   * Associazione opzionale con il modello `Track`.
   */
  public readonly Track?: Track;
}

/**
 * Inizializzazione del modello `Purchase` con Sequelize.
 *
 * - Definisce i campi, vincoli, chiavi esterne e indici.
 * - Non utilizza i timestamp `createdAt` e `updatedAt`.
 */
Purchase.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    track_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "tracks", key: "id" },
      onDelete: "CASCADE",
    },
    purchased_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    costo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    download_token: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
  },
  {
    tableName: "purchases",
    sequelize,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "track_id"],
      },
      {
        unique: true,
        fields: ["download_token"],
      },
    ],
  }
);

export default Purchase;