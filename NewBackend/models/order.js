'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'user_id' });
      Order.belongsTo(models.Shop, { foreignKey: 'shop_id' });
      Order.hasMany(models.OrderItem, { foreignKey: 'order_id' });
    }
  }

  Order.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    shop_id: { type: DataTypes.UUID, allowNull: false },
    total_amount: DataTypes.DECIMAL(10, 2),
    status: DataTypes.ENUM('pending', 'confirmed', 'delivered', 'cancelled'),
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Order;
};
