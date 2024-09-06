const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    type: Date 
  },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'] 
  },
  fullAddress: { 
    type: String 
  },
  
  country: { 
    type: String 
  },

  state: { 
    type: String 
  },

  landmark: { 
    type: String 
  },
  
  role: { 
    type: String, 
    enum: ['Landlord', 'Tenant', 'isAdmin', 'isSuperAdmin'], 
    default: "Landlord",
    required: true, 
  }, 
  isAdmin: { 
    type: Boolean, 
    default: false 
  },         
  isSuperAdmin: { 
    type: Boolean, 
    default: false 
  },    
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  profilePicture: {
    pictureId: { type: String },
    pictureUrl: { type: String }
  },
  properties: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property' 
  }], // Reference to properties owned or rented
  tenants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // Reference to tenants added by a landlord


}, {timestamps: true});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
