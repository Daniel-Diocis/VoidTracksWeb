import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/sequelize";

interface PlaylistTrackAttributes {
  id: number;
  playlist_id: number;
  track_id: string;
  is_favorite: boolean;
}

interface PlaylistTrackCreationAttributes
  extends Optional<PlaylistTrackAttributes, "id" | "is_favorite"> {}

class PlaylistTrack
  extends Model<PlaylistTrackAttributes, PlaylistTrackCreationAttributes>
  implements PlaylistTrackAttributes
{
  public id!: number;
  public playlist_id!: number;
  public track_id!: string;
  public is_favorite!: boolean;

  // Associazione opzionale con il modello Track
  public Track?: import("./Track").default;
}

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
