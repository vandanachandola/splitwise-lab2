const express = require('express');

const transactionController = require('../controllers/transaction-controller');

const router = express.Router();

// record a transaction
router.post('/transaction', transactionController.recordTransaction);

// get all transactions
router.get('/transaction', transactionController.getTransactions);

module.exports = router;
