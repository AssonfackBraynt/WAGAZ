'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ShopLocation extends Model {
    static associate(models) {
      ShopLocation.belongsTo(models.Shop, { foreignKey: 'shop_id' });
    }
  }

  ShopLocation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    latitude: DataTypes.DECIMAL(10, 8),
    longitude: DataTypes.DECIMAL(11, 8),
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    region: DataTypes.STRING,
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'ShopLocation',
    tableName: 'shop_locations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ShopLocation;
};
