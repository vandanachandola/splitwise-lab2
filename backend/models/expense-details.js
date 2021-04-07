const mongoose = require('mongoose');

const { Schema } = mongoose;

const expenseDetailSchema = new Schema(
  {
    owedBy: { type: String },
    owedAmount: { type: Number },
    owedTo: { type: String },
    isSettled: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = expenseDetailSchema;
