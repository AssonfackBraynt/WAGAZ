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
    fuel_type: DataTypes.ENUM('gasoil', 'super', 'diesel', 'kerosene'),
    tank_capacity_liters: { type: DataTypes.INTEGER, allowNull: true }, // Optional, but useful
    tank_level_percentage: { type: DataTypes.INTEGER },
    remaining_liters: { type: DataTypes.INTEGER },
    price_per_liter: { type: DataTypes.INTEGER },

    last_recharged_at: { type: DataTypes.DATE }, // When fuel was added
    last_checked_at: { type: DataTypes.DATE },   // When level was updated manually

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
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
