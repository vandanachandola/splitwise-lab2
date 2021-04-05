const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String },
    groupPicture: { type: String },
    createdBy: { type: String },
    members: [{ type: String }],
    pendingInvites: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
