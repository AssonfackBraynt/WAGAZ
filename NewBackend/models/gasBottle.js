'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class GasBottle extends Model {
    static associate(models) {
      GasBottle.belongsTo(models.Shop, { foreignKey: 'shop_id' });
      GasBottle.belongsTo(models.BottleMark, { foreignKey: 'brand_id' });
    }
  }

  GasBottle.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    brand_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    size: {
      type: DataTypes.ENUM('3kg', '6kg', '12kg'),
      allowNull: false
    },
    filled: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unit_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'GasBottle',
    tableName: 'gas_bottles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return GasBottle;
};
