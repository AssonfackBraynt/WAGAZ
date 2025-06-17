'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ShopProduct extends Model {
    static associate(models) {
      ShopProduct.belongsTo(models.Shop, { foreignKey: 'shop_id' });
    }
  }

  ShopProduct.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: true },
    productType: { type: DataTypes.STRING, allowNull: false }, 
    variant: { type: DataTypes.STRING, defaultValue: 'default' },
    price: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    image: DataTypes.STRING,
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'ShopProduct',
    tableName: 'shop_products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ShopProduct;
};
