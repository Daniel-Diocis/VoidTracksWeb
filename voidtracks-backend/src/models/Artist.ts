import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/sequelize";

interface ArtistAttributes {
  id: string;
  nome: string;
  genere?: string;
  paese?: string;
  descrizione?: string;
  profile_path?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

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
