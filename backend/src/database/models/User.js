import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

export class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },

    firebaseUid: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true
    },

    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },

    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'usuarios',
    timestamps: true
  }
);
