const mongoose = require('mongoose');

const { Schema } = mongoose;

const expenseSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
    description: { type: String },
    totalExpense: { type: Number },
    lenderId: { type: Schema.Types.ObjectId, ref: 'User' },
    lenderName: { type: String },
    expenseDetails: [
      {
        groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
        expenseId: { type: Schema.Types.ObjectId },
        borrowerId: { type: Schema.Types.ObjectId, ref: 'User' },
        lenderId: { type: Schema.Types.ObjectId, ref: 'User' },
        lenderName: { type: String },
        groupName: { type: String },
        expense: { type: Number },
        isSettled: { type: Boolean },
      },
    ],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String },
        text: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
