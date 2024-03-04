const { pool } = require("../utils/database");
const Transaction = require("../models/transaction");
const { Sequelize } = require("sequelize");

const getPageTransactions = async (req, res) => {
  const userId = parseInt(req.query.id);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const transactions = await Transaction.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      attributes: [
        ["id", "transaction_id"],
        "funds_flow",
        "amount",
        ["transaction_type", "type"],
        "receiver_name",
        "initiator_name",
        // Sequelize directly supports date formatting in raw queries, but here we'll fetch the date as is
        // and format it in JavaScript
        "created_at",
      ],
      limit: limit,
      offset: offset,
    });

    const response = {
      code: 200,
      message: "success",
      data: {
        transactions: transactions.map((tx) => ({
          transaction_id: tx.getDataValue("transaction_id"),
          funds_flow: tx.funds_flow === 1 ? "receiving" : "sending",
          amount: tx.amount,
          type: tx.getDataValue("type"), // Using getDataValue to access aliased fields
          receiver_name: tx.receiver_name,
          initiator_name: tx.initiator_name,
          // Formatting the date in JavaScript
          date_time: tx.created_at
            .toISOString()
            .replace(/T/, " ")
            .replace(/\..+/, ""),
        })),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

const getTransactionsByDateRange = async (req, res) => {
  const userId = parseInt(req.query.id);
  const startDate = req.query.start_date;
  const endDate = req.query.end_date || new Date().toISOString().slice(0, 10); // Defaults to current date if not provided

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  if (!startDate) {
    return res.status(400).json({ message: "Start date is required" });
  }

  try {
    const transactions = await Transaction.findAll({
      where: {
        user_id: userId,
        // Use Sequelize's Op.between to query a range
        created_at: {
          [Sequelize.Op.between]: [startDate, endDate],
        },
      },
      order: [["created_at", "DESC"]],
      attributes: [
        ["id", "transaction_id"],
        "funds_flow",
        "amount",
        ["transaction_type", "type"],
        "receiver_name",
        "initiator_name",
        // Directly use created_at, format date in the response mapping
        "created_at",
      ],
    });

    const response = {
      code: 200,
      message: "success",
      data: {
        transactions: transactions.map((tx) => ({
          transaction_id: tx.getDataValue("transaction_id"),
          funds_flow: tx.funds_flow === 1 ? "receiving" : "sending",
          amount: tx.amount,
          type: tx.getDataValue("type"),
          receiver_name: tx.receiver_name,
          initiator_name: tx.initiator_name,
          // Format the date as 'YYYY-MM-DD'
          date: tx.created_at.toISOString().slice(0, 10),
        })),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching transactions by date range:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

module.exports = {
  getPageTransactions,
  getTransactionsByDateRange,
};
