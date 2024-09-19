const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blacklistedTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Token will automatically be removed after 24 hours (86400 seconds)
  },
});

const BlacklistedTokenModel = mongoose.model('BlacklistedToken', blacklistedTokenSchema);



module.exports = BlacklistedTokenModel;
