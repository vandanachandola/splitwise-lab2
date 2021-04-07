const mongoose = require('mongoose');

const { Schema } = mongoose;

const inviteSchema = new Schema(
  {
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    invitee: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String },
  },
  { timestamps: true }
);

module.exports = inviteSchema;
