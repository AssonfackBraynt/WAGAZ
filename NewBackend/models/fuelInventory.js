'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class FuelInventory extends Model {
    static associate(models) {
      FuelInventory.belongsTo(models.Shop, { foreignKey: 'shop_id' });
    }
  }

  FuelInventory.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: false },
    fuel_type: DataTypes.ENUM('gasoil', 'super'),
    tank_level_percentage: DataTypes.INTEGER,
    price_per_liter: DataTypes.INTEGER,
    remaining_liters: DataTypes.INTEGER,
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'FuelInventory',
    tableName: 'fuel_inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return FuelInventory;
};
