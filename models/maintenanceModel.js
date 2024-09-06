const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  requestFor: {
    type: String,
    required: true,
    trim: true
  },
  additionalInfo: {
    type: String,
    trim: true
  },
  availableDates: {
    type: [Date],
    validate: {
      validator: function(dates) {
        return dates.length === 3; // Ensure exactly 3 dates are provided
      },
      message: 'Please provide exactly three dates for availability.'
    }
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^[0-9]{11}$/ // Ensures the phone number is exactly 11 digits
  },
  pictures: [{
    pictureId: { type: String },
    pictureUrl: { type: String }
  }],
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  requestedDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  }
}, { timestamps: true });

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = MaintenanceRequest;
