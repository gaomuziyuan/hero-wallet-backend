const { Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/sequelize");

class Card extends Model {}

Card.init(
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
    card_number: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    issue_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expire_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "CAD",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: "0: expired, 1: active, 2: lost, 3: in review",
    },
    card_pin: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    card_cvv: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    card_form: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: "0: virtual, 1: physical",
    },
    card_type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: "0: debit, 1: credit, 2: prepaid",
    },
    active_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Card",
    tableName: "card",
    timestamps: false,
  }
);

module.exports = Card;
