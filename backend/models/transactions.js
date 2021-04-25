const mongoose = require('mongoose');

const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
    groupName: { type: String },
    description: { type: String },
    type: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
