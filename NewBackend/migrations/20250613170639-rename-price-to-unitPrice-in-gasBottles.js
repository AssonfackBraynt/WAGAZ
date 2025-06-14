'use strict';
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('gas_bottles', 'unitPrice', 'unit_price');
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('gas_bottles', 'unit_price', 'unitPrice');
  }
};