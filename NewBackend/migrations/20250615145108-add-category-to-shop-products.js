module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('shop_products', 'category', {
      type: Sequelize.STRING,
      allowNull: true, // or false if you want it to be required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('shop_products', 'category');
  }
};