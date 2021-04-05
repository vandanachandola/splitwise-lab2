const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    emailId: { type: String },
    password: { type: String },
    name: { type: String },
    profilePicture: { type: String },
    phoneNo: { type: String },
    defaultCurrency: { type: String },
    timeZone: { type: String },
    language: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
