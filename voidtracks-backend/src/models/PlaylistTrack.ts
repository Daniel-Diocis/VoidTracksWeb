import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeInstance } from "../db/sequelize";

const sequelize = getSequelizeInstance();

/**
 * Attributi della tabella `playlist_tracks`, che rappresenta l'associazione
 * tra una `Playlist` e un `Track`.
 */
interface PlaylistTrackAttributes {
  id: number;             // ID univoco dell'associazione
  playlist_id: number;    // ID della playlist
  track_id: string;       // ID del brano
  is_favorite: boolean;   // Indica se il brano è segnato come preferito
}

/**
 * Attributi opzionali alla creazione di una nuova associazione.
 * `id` e `is_favorite` sono gestiti da Sequelize.
 */
interface PlaylistTrackCreationAttributes
  extends Optional<PlaylistTrackAttributes, "id" | "is_favorite"> {}

/**
 * Modello Sequelize che rappresenta un brano all'interno di una playlist.
 *
 * - Contiene anche il flag `is_favorite` per indicare se il brano è preferito.
 * - Relazionato a `Playlist` e `Track` tramite chiavi esterne.
 * - Ogni combinazione `playlist_id` + `track_id` è unica, per evitare duplicati.
 */
class PlaylistTrack
  extends Model<PlaylistTrackAttributes, PlaylistTrackCreationAttributes>
  implements PlaylistTrackAttributes
{
  public id!: number;
  public playlist_id!: number;
  public track_id!: string;
  public is_favorite!: boolean;

  /**
   * Brano associato a questa entry della playlist.
   * Popolato automaticamente se si utilizza `include: [Track]` nelle query.
   */
  public Track?: import("./Track").default;
}

/**
 * Inizializzazione del modello `PlaylistTrack` con Sequelize.
 *
 * - Rappresenta la tabella pivot many-to-many `playlist_tracks`.
 * - Impone un vincolo di unicità sulla coppia `playlist_id` + `track_id`.
 */
PlaylistTrack.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    playlist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "playlists", key: "id" },
      onDelete: "CASCADE",
    },
    track_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "tracks", key: "id" },
      onDelete: "CASCADE",
    },
    is_favorite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "playlist_tracks",
    sequelize,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["playlist_id", "track_id"],
      },
    ],
  }
);

export default PlaylistTrack;