'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        primaryKey: true
      },

      firebaseUid: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true
      },

      name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },

      email: {
        type: Sequelize.STRING(254),
        allowNull: false,
        unique: true
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  }
};
