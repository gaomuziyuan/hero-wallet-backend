const express = require("express");
const router = express.Router();
const { createSchema, validate } = require("../middlewares/validation")
const {
  getPageTransactions,
  getTransactionsByDateRange,
} = require("../controllers/transactionController");

// Schema for getting transactions by page
const transactionsByPageSchema = createSchema({
  query: {
    id: true
  },
})

const transactionsByDateSchema = createSchema({
  query: {
    id: true,
    start_date: true,
    end_date: false
  },
})

router.get("/v1/transactions/page", validate(transactionsByPageSchema), getPageTransactions);
router.get("/v1/transactions/date_range", validate(transactionsByDateSchema), getTransactionsByDateRange);

module.exports = router;
