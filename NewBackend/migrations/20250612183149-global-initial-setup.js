'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Users table
await queryInterface.createTable('users', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING, allowNull: false, unique: true },
  password: { type: Sequelize.STRING, allowNull: false },
  phone: { type: Sequelize.STRING, allowNull: true },
  role: { type: Sequelize.ENUM('user', 'shop_owner', 'admin'), allowNull: false, defaultValue: 'user' },
  created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
  updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
});

// Partners table
await queryInterface.createTable('partners', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  company_name: { type: Sequelize.STRING, allowNull: true },
  address: { type: Sequelize.STRING, allowNull: true },
  status: {
    type: Sequelize.ENUM('active', 'pending', 'suspended'),
    defaultValue: 'pending',
    allowNull: false
  },
  created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
  updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
});


    // Shops table
    await queryInterface.createTable('shops', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      latitude: { type: Sequelize.DOUBLE, allowNull: false },
      longitude: { type: Sequelize.DOUBLE, allowNull: false },
      owner_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Bottle Marks (brand)
    await queryInterface.createTable('bottle_marks', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      size: { type: Sequelize.ENUM('3kg', '6kg', '12kg'), allowNull: false },
      image: { type: Sequelize.STRING, allowNull: false }, // e.g., 'gasImages/k-gas.png'
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Gas Bottles
    await queryInterface.createTable('gas_bottles', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      shop_id: {
        type: Sequelize.INTEGER,
        references: { model: 'shops', key: 'id' },
        onDelete: 'CASCADE'
      },
      brand_id: {
        type: Sequelize.INTEGER,
        references: { model: 'bottle_marks', key: 'id' },
        onDelete: 'CASCADE'
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      price: { type: Sequelize.FLOAT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Shop Products (e.g., accessories)
    await queryInterface.createTable('shop_products', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      shop_id: {
        type: Sequelize.INTEGER,
        references: { model: 'shops', key: 'id' },
        onDelete: 'CASCADE'
      },
      name: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.ENUM('shop_product'), allowNull: false }, // Extendable later
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      price: { type: Sequelize.FLOAT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Fuel Inventory
    await queryInterface.createTable('fuel_inventories', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      shop_id: {
        type: Sequelize.INTEGER,
        references: { model: 'shops', key: 'id' },
        onDelete: 'CASCADE'
      },
      type: { type: Sequelize.ENUM('super', 'diesel', 'kerosene'), allowNull: false },
      quantity: { type: Sequelize.FLOAT, allowNull: false },
      price: { type: Sequelize.FLOAT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Sales Analytics
    await queryInterface.createTable('sales_analytics', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      shop_id: {
        type: Sequelize.INTEGER,
        references: { model: 'shops', key: 'id' },
        onDelete: 'CASCADE'
      },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      product_type: { type: Sequelize.ENUM('gas', 'fuel', 'shop_product'), allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      total_sales: { type: Sequelize.FLOAT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sales_analytics');
    await queryInterface.dropTable('fuel_inventories');
    await queryInterface.dropTable('shop_products');
    await queryInterface.dropTable('gas_bottles');
    await queryInterface.dropTable('bottle_marks');
    await queryInterface.dropTable('shops');
    await queryInterface.dropTable('partners');
    await queryInterface.dropTable('users');

    // Drop ENUMs manually if needed
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_users_role;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_partners_status;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_bottle_marks_size;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_shop_products_type;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_fuel_inventories_type;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_sales_analytics_product_type;");
  }
};

