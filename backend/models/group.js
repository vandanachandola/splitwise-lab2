const mongoose = require('mongoose');

const { Schema } = mongoose;

const groupSchema = new Schema(
  {
    name: { type: String },
    groupPicture: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    creatorName: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    pendingInvites: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
