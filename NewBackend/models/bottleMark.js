'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BottleMark extends Model {
    static associate(models) {
      BottleMark.hasMany(models.GasBottle, { foreignKey: 'brand_id' });
    }
  }

  BottleMark.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING, // URL or image path
      allowNull: true
    },
    size: {
      type: DataTypes.ENUM('3kg', '6kg', '12kg'),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: { 
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'BottleMark',
    tableName: 'bottle_marks',
    timestamps: false
  });

  return BottleMark;
};
