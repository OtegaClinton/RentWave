const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }, // Name or title of the property

  location: { 
    type: String, 
    required: true 
  }, // Location of the property

  price: { 
    type: Number, 
    required: true 
  }, // Price of the property

  propertyType: { 
    type: String, 
    required: true,
    enum: ['Apartment', 'House', 'Condo', 'Townhouse', 'Studio'], 
    default: 'Apartment' 
  }, // Type of property

  bedrooms: { 
    type: Number, 
    required: true 
  }, // Number of bedrooms

  bathrooms: { 
    type: Number, 
    required: true 
  }, // Number of bathroom

  amenities: { 
    type: [String],
    default: []
  }, // List of amenities (e.g., pool, gym)

  description: { 
    type: String 
  }, // Detailed description of the property

  images: [
    {
      pictureId: { 
        type: String 
      },
      pictureUrl: { 
        type: String 
      }
    }
  ], // Array of image URLs for the property

  listedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // Reference to the user who listed the property

  tenant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant' 
  }, // Reference to the tenant currently renting the property, if applicable

  isAvailable: { 
    type: Boolean, 
    default: true 
  } // Availability status of the property
}, { timestamps: true });

const propertyModel = mongoose.model('Property', propertySchema);

module.exports = propertyModel;
