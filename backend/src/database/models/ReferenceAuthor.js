
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

export class ReferenceAuthor extends Model {}

ReferenceAuthor.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },

    referenciaId: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },

    posicao: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    tipo: {
      type: DataTypes.ENUM('pessoa', 'instituicao'),
      allowNull: false
    },

    nome: {
      type: DataTypes.STRING(300),
      allowNull: true
    },

    nomeInstituicao: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    subordinacao: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'ReferenceAuthor',
    tableName: 'autores_referencia',
    timestamps: false
  }
);
