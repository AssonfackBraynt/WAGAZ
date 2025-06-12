'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class WalletTransaction extends Model {
    static associate(models) {
      WalletTransaction.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  WalletTransaction.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    amount: DataTypes.DECIMAL(10, 2),
    transaction_type: DataTypes.ENUM('credit', 'debit'),
    description: DataTypes.TEXT,
    reference_id: DataTypes.UUID,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'WalletTransaction',
    tableName: 'wallet_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return WalletTransaction;
};
