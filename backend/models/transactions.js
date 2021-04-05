const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: String },
    groupId: { type: String },
    userName: { type: String },
    groupName: { type: String },
    description: { type: String },
    type: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
