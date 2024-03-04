const { Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/sequelize");

class Transaction extends Model {}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    initiator_name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    receiver_name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    card_number: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    transaction_type: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "purchase/p2p/e-transfer/refund/merchant/topup",
    },
    funds_flow: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      comment: "1: receiving, 0: spending/paying",
    },
    currency: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    result: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "to be defined later",
    },
    category: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    trust_score: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 5,
    },
    description: {
      type: DataTypes.STRING(128),
      defaultValue: null,
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 1.0,
    },
    location_of_transaction: {
      type: DataTypes.JSON,
      defaultValue: "{}",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: null,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "transaction",
    timestamps: false, // Considering you're managing created_at and updated_at manually
  }
);

module.exports = Transaction;
