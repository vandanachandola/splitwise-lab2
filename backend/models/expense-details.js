const mongoose = require('mongoose');

const expenseDetailSchema = new mongoose.Schema(
  {
    owedBy: { type: String },
    owedAmount: { type: Number },
    owedTo: { type: String },
    isSettled: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExpenseDetail', expenseDetailSchema);
