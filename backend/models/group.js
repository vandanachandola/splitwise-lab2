const mongoose = require('mongoose');
const inviteSchema = require('./invites');

const { Schema } = mongoose;

const groupSchema = new Schema(
  {
    name: { type: String },
    groupPicture: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    pendingInvites: [inviteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
