'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Rename the old ENUM (to free the name)
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_fuel_inventory_fuel_type" RENAME TO "enum_fuel_inventory_fuel_type_old";
    `);

    // 2. Create the new ENUM with correct values
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_fuel_inventory_fuel_type" AS ENUM ('Gasoil', 'Super', 'Diesel', Kkerosene');
    `);

    // 3. Alter the column to use the new ENUM type
    await queryInterface.sequelize.query(`
      ALTER TABLE "fuel_inventory"
      ALTER COLUMN "fuel_type" TYPE "enum_fuel_inventory_fuel_type"
      USING "fuel_type"::text::"enum_fuel_inventory_fuel_type";
    `);

    // 4. Drop the old ENUM
    await queryInterface.sequelize.query(`DROP TYPE "enum_fuel_inventory_fuel_type_old";`);

    // 5. Add the new columns
    await queryInterface.addColumn('fuel_inventory', 'tank_capacity_liters', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('fuel_inventory', 'last_recharged_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('fuel_inventory', 'last_checked_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove added columns
    await queryInterface.removeColumn('fuel_inventory', 'tank_capacity_liters');
    await queryInterface.removeColumn('fuel_inventory', 'last_recharged_at');
    await queryInterface.removeColumn('fuel_inventory', 'last_checked_at');

    // Drop new ENUM and restore old one
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_fuel_inventory_fuel_type_old" AS ENUM ('gasoil', 'super', 'diesel', 'Kerosene');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "fuel_inventory"
      ALTER COLUMN "fuel_type" TYPE "enum_fuel_inventory_fuel_type_old"
      USING "fuel_type"::text::"enum_fuel_inventory_fuel_type_old";
    `);

    await queryInterface.sequelize.query(`DROP TYPE "enum_fuel_inventory_fuel_type";`);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_fuel_inventory_fuel_type_old" RENAME TO "enum_fuel_inventory_fuel_type";
    `);
  }
};
