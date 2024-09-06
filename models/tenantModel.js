const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true 
  }, 
  lastName: { 
    type: String, 
    required: true 
  }, 
  email: { 
    type: String, 
    required: true, 
    unique: true 
  }, 
  password: { 
    type: String, 
    required: true 
  },         
  phoneNumber: { 
    type: String, 
    required: true,
    unique: true 
  },  
  dateOfBirth: {
    type: Date,
    required: true // Tenant's date of birth
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true // Tenant's gender with predefined options
  },
  fullAddress: {
    type: String,
    required: true // Full address of the tenant
  },
  country: {
    type: String,
    required: true // Country of residence
  },
  state: {
    type: String,
    required: true // State of residence
  },
  landmark: {
    type: String,
    required: true // Nearby landmark for better address clarity
  },    
  isVerified: { 
    type: Boolean, 
    default: true 
  },
  profilePicture: {
    pictureId: { type: String },
    pictureUrl: { type: String },
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
  leaseStart: { 
    type: Date, 
    required: true 
  },
  leaseEnd: { 
    type: Date, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'Tenant' 
  }
  
}, { timestamps: true });

const tenantModel = mongoose.model('Tenant', tenantSchema);

module.exports = tenantModel;
