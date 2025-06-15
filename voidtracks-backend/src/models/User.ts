import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/sequelize';

interface UserAttributes {
  id: number;
  username: string;
  password_hash: string;
  tokens: number;
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'tokens' | 'role' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password_hash!: string;
  public tokens!: number;
  public role!: 'user' | 'admin';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    role: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'user',
    },
  },
  {
    tableName: 'users',
    sequelize,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default User;