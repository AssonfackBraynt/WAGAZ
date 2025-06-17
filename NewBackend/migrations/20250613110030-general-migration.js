'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    // Users table
    await queryInterface.createTable('users', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      firstName: { type: Sequelize.STRING, allowNull: false },
      lastName: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      phone: { type: Sequelize.STRING, allowNull: true },
      whatsappNumber: { type: Sequelize.STRING, allowNull: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      userType: { type: Sequelize.ENUM('customer', 'partner', 'admin'), allowNull: false, defaultValue: 'customer' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Shops table
    await queryInterface.createTable('shops', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      niu_uin: { type: Sequelize.STRING, allowNull: false },
      location: { type: Sequelize.STRING, allowNull: false },
      user_id: { type: DataTypes.UUID, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    //shop_locationss
    await queryInterface.createTable('shop_locations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: DataTypes.UUIDV4, // or Sequelize.UUIDV4 if using Sequelize's default
        primaryKey: true
      },
      shop_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'shops',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      region: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // Bottle Marks (brand)
    await queryInterface.createTable('bottle_marks', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      image: { type: Sequelize.STRING, allowNull: true }, // e.g., 'gasImages/k-gas.png'
      size: { type: Sequelize.ENUM('3kg', '6kg', '12kg'), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Gas Bottles
    await queryInterface.createTable('gas_bottles', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      shop_id: { type: DataTypes.UUID, references: { model: 'shops', key: 'id' }, onDelete: 'CASCADE' },
      brand_id: { type: DataTypes.UUID, references: { model: 'bottle_marks', key: 'id' }, onDelete: 'CASCADE' },
      size: { type: Sequelize.ENUM('3kg', '6kg', '12kg'), allowNull: false },
      filled: { type: Sequelize.INTEGER, allowNull: false },
      total: { type: Sequelize.FLOAT, allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: true },
      unit_price: { type: Sequelize.FLOAT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Shop Products (e.g., accessories)
    await queryInterface.createTable('shop_products', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      shop_id: { type: DataTypes.UUID, references: { model: 'shops', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING, allowNull: false },
      unit_price: { type: Sequelize.INTEGER, allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Orders
    await queryInterface.createTable('orders', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      shop_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'shops', key: 'id' },
        onDelete: 'CASCADE'
      },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      status: { type: DataTypes.ENUM('pending', 'confirmed', 'delivered', 'cancelled'), allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Order Items table
    await queryInterface.createTable('order_items', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onDelete: 'CASCADE'
      },
      product_type: { type: DataTypes.ENUM('gas_bottle', 'shop_product', 'fuel'), allowNull: true },
      product_id: { type: DataTypes.UUID, allowNull: true },
      quantity: { type: DataTypes.INTEGER, allowNull: true },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Fuel Inventory
    await queryInterface.createTable('fuel_inventory', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      shop_id: { type: DataTypes.UUID, references: { model: 'shops', key: 'id' }, onDelete: 'CASCADE' },
      fuel_type: { type: Sequelize.ENUM('gasoil', 'super', 'diesel', 'Kerosene'), allowNull: false },
      tank_level_percentage: { type: Sequelize.INTEGER, allowNull: true },
      price_per_liter: { type: Sequelize.INTEGER, allowNull: true },
      remaining_liters: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Sales Analytics
    await queryInterface.createTable('sales_analytics', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      shop_id: { type: DataTypes.UUID, references: { model: 'shops', key: 'id' }, onDelete: 'CASCADE' },
      product_type: { type: Sequelize.ENUM('gas_bottle', 'shop_product', 'fuel'), allowNull: false },
      product_id: { type: DataTypes.UUID, references: { model: 'shop_products', key: 'id' }, onDelete: 'CASCADE' },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      total_sales: { type: Sequelize.FLOAT, allowNull: false },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Wallet Transactions table
    await queryInterface.createTable('wallet_transactions', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      transaction_type: { type: DataTypes.ENUM('credit', 'debit'), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      reference_id: { type: DataTypes.UUID, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });


  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('wallet_transactions');
    await queryInterface.dropTable('sales_analytics');
    await queryInterface.dropTable('fuel_inventory');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('shop_products');
    await queryInterface.dropTable('gas_bottles');
    await queryInterface.dropTable('bottle_marks');
    await queryInterface.dropTable('shop_locations');
    await queryInterface.dropTable('shops');
    await queryInterface.dropTable('users');

    // Drop ENUMs manually if needed
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_users_role;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_bottle_marks_size;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_shop_products_type;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_orders_status;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_order_items_product_type;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_fuel_inventory_type;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_sales_analytics_product_type;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_wallet_transactions_transaction_type;");
  }
};

