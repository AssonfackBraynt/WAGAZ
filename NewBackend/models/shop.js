'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Shop extends Model {
    static associate(models) {
      Shop.belongsTo(models.User, { foreignKey: 'user_id' });
      Shop.hasOne(models.ShopLocation, { foreignKey: 'shop_id' });
      Shop.hasMany(models.GasBottle, { foreignKey: 'shop_id' });
      Shop.hasMany(models.ShopProduct, { foreignKey: 'shop_id' });
      Shop.hasMany(models.FuelInventory, { foreignKey: 'shop_id' });
      Shop.hasMany(models.Order, { foreignKey: 'shop_id' });
      Shop.hasMany(models.SalesAnalytics, { foreignKey: 'shop_id' });
    }
  }

  Shop.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    niu_uin: DataTypes.STRING,
    location: DataTypes.STRING,
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'Shop',
    tableName: 'shops',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Create fuel inventory after a new shop is created
  Shop.afterCreate(async (shop, options) => {
    const { FuelInventory } = sequelize.models;
    const FUEL_TYPES = ['gasoil', 'super', 'diesel', 'kerosene'];

    for (const type of FUEL_TYPES) {
      await FuelInventory.create({
        shop_id: shop.id,
        fuel_type: type,
        tank_level_percentage: 0,
        price_per_liter: 0,
        remaining_liters: 0,
      });
    }

    console.log(`✅ Fuel inventory initialized for shop ${shop.name}`);
  });
  return Shop;
};
