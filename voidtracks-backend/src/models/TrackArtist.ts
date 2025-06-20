import { DataTypes, Model } from "sequelize";
import sequelize from "../db/sequelize";

class TrackArtist extends Model {
  public track_id!: string;
  public artist_id!: string;
}

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
    timestamps: false, // di solito join table non ha timestamp
  }
);

export default TrackArtist;