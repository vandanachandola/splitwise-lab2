const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema(
  {
    groupId: { type: String },
    invitedBy: { type: String },
    invitee: { type: String },
    status: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invite', inviteSchema);
