const mongoose = require('mongoose');

const { Schema } = mongoose;

const expenseDetailSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
    expenseId: { type: Schema.Types.ObjectId },
    borrowerId: { type: Schema.Types.ObjectId, ref: 'User' },
    lenderId: { type: Schema.Types.ObjectId, ref: 'User' },
    expense: { type: Number },
    isSettled: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExpenseDetail', expenseDetailSchema);
