const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  firstName: { 
    type: String,
    required: true
  },
  lastName: { 
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid'
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Credit Card', 'Cash', 'Other'],
    default: 'Bank Transfer'
  },
  transactionId: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  }
}, { timestamps: true });

const paymentModel = mongoose.model('Payment', paymentSchema);

module.exports = paymentModel;
