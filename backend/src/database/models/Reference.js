
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

export class Reference extends Model {}

Reference.init(
  {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },

    usuarioId: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },

    tipo: {
      type: DataTypes.ENUM(
        'livro',
        'artigoPeriodico',
        'paginaWeb',
        'trabalhoAcademico'
      ),
      allowNull: false
    },

    titulo: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: false
    },

    autoria: {
      type: DataTypes.ENUM('conhecida', 'desconhecida'),
      allowNull: false
    },

    quantidadeAutores: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    textoPuro: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    segmentos: {
      type: DataTypes.JSON,
      allowNull: false
    },

    avisos: {
      type: DataTypes.JSON,
      allowNull: false
    },

    versaoNorma: {
      type: DataTypes.STRING(30),
      allowNull: false
    },

    versaoFormatador: {
      type: DataTypes.STRING(30),
      allowNull: false
    },

    perfilInstitucional: {
      type: DataTypes.STRING(40),
      allowNull: true
    },

    schemaVersion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },

    idempotencyKey: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },

    requestHash: {
      type: DataTypes.CHAR(64),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Reference',
    tableName: 'referencias_bibliograficas',
    timestamps: true
  }
);
