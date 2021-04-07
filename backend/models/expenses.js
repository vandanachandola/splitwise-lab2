const mongoose = require('mongoose');
const expenseDetailSchema = require('./expense-details');

const { Schema } = mongoose;

const expenseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    description: { type: String },
    totalExpense: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expenseDetails: [expenseDetailSchema],
  },
  { timestamps: true }
);

module.exports = expenseSchema;
