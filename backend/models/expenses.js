const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: String },
    groupId: { type: String },
    description: { type: String },
    totalExpense: { type: Number },
    createdBy: { type: String },
    members: [{ type: String }],
    pendingInvites: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
