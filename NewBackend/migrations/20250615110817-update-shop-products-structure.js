'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('shop_products', 'name');

    await queryInterface.addColumn('shop_products', 'productType', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('shop_products', 'variant', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'default',
    });

    await queryInterface.addColumn('shop_products', 'image', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback: Add back `name`, remove new fields
    await queryInterface.addColumn('shop_products', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn('shop_products', 'productType');
    await queryInterface.removeColumn('shop_products', 'variant');
    await queryInterface.removeColumn('shop_products', 'image');
  }
};

