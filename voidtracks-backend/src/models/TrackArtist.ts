import { DataTypes, Model } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";

const sequelize = getSequelizeInstance();

/**
 * Modello Sequelize `TrackArtist` per rappresentare la relazione many-to-many
 * tra brani (`Track`) e artisti (`Artist`).
 *
 * - Ogni riga collega un brano a un artista.
 * - Utilizza `track_id` e `artist_id` come chiave primaria composta.
 * - La tabella è una join table senza timestamp.
 */
class TrackArtist extends Model {
  public track_id!: string;     // ID del brano (UUID)
  public artist_id!: string;    // ID dell'artista (UUID)
}

/**
 * Inizializzazione del modello `TrackArtist`.
 *
 * - Mappa la tabella `track_artists`.
 * - Definisce vincoli di integrità referenziale verso `tracks` e `artists`.
 */
TrackArtist.init(
  {
    track_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "tracks",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    artist_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "artists",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "track_artists",
    sequelize,
    timestamps: false, // Le tabelle pivot non richiedono timestamp
  }
);

export default TrackArtist;