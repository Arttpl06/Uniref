
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('autores_referencia', {
      id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        primaryKey: true
      },

      referenciaId: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'referencias_bibliograficas',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      posicao: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      tipo: {
        type: Sequelize.ENUM('pessoa', 'instituicao'),
        allowNull: false
      },

      nome: {
        type: Sequelize.STRING(300),
        allowNull: true
      },

      nomeInstituicao: {
        type: Sequelize.STRING(500),
        allowNull: true
      },

      subordinacao: {
        type: Sequelize.STRING(500),
        allowNull: true
      }
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    await queryInterface.addIndex(
      'autores_referencia',
      ['referenciaId', 'posicao'],
      {
        unique: true,
        name: 'uq_autores_referencia_posicao'
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('autores_referencia');
  }
};
