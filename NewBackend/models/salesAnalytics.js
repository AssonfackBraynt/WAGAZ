'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class SalesAnalytics extends Model {
    static associate(models) {
      SalesAnalytics.belongsTo(models.Shop, { foreignKey: 'shop_id' });
    }
  }

  SalesAnalytics.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: false },
    product_type: DataTypes.ENUM('gas_bottle', 'shop_product', 'fuel'),
    product_id: DataTypes.UUID,
    units_sold: DataTypes.INTEGER,
    revenue: DataTypes.DECIMAL(10, 2),
    sale_date: DataTypes.DATEONLY,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'SalesAnalytics',
    tableName: 'sales_analytics',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return SalesAnalytics;
};
