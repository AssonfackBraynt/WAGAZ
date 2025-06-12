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

  return Shop;
};
