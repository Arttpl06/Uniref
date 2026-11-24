'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('referencias_bibliograficas', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },

      usuarioId: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      tipo: {
        type: Sequelize.ENUM(
          'livro',
          'artigoPeriodico',
          'paginaWeb',
          'trabalhoAcademico'
        ),
        allowNull: false
      },

      titulo: {
        type: Sequelize.STRING(1000),
        allowNull: false
      },

      metadata: {
        type: Sequelize.JSON,
        allowNull: false
      },

      autoria: {
        type: Sequelize.ENUM('conhecida', 'desconhecida'),
        allowNull: false
      },

      quantidadeAutores: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      textoPuro: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      segmentos: {
        type: Sequelize.JSON,
        allowNull: false
      },

      avisos: {
        type: Sequelize.JSON,
        allowNull: false
      },

      versaoNorma: {
        type: Sequelize.STRING(30),
        allowNull: false
      },

      versaoFormatador: {
        type: Sequelize.STRING(30),
        allowNull: false
      },

      perfilInstitucional: {
        type: Sequelize.STRING(40),
        allowNull: true
      },

      schemaVersion: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },

      idempotencyKey: {
        type: Sequelize.CHAR(36),
        allowNull: false
      },

      requestHash: {
        type: Sequelize.CHAR(64),
        allowNull: false
      },

      createdAt: {
        type: Sequelize.DATE(3),
        allowNull: false
      },

      updatedAt: {
        type: Sequelize.DATE(3),
        allowNull: false
      }
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addIndex(
      'referencias_bibliograficas',
      ['usuarioId', 'idempotencyKey'],
      {
        unique: true,
        name: 'uq_referencia_idempotencia'
      }
    );

    await queryInterface.addIndex(
      'referencias_bibliograficas',
      ['usuarioId', 'createdAt', 'id'],
      { name: 'idx_referencia_historico' }
    );

    await queryInterface.addIndex(
      'referencias_bibliograficas',
      ['usuarioId', 'tipo', 'createdAt'],
      { name: 'idx_referencia_tipo' }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('referencias_bibliograficas');
  }
};
