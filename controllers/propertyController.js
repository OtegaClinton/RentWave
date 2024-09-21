const propertyModel = require("../models/propertyModel"); 
const userModel = require("../models/userModel"); 
const tenantModel = require("../models/tenantModel"); 
const cloudinary = require("../helpers/cloudinary");
const mongoose = require('mongoose');
const fileSystem = require("fs");
const path = require('path');
const sendMail=require("../helpers/email");




exports.createProperty = async (req, res) => {
  try {
    const userId = req.user.id;

    const landlord = await userModel.findById(userId);
    if (!landlord) {
      return res.status(404).json({ message: 'Landlord not found' });
    }

    const {
      name,
      location,
      price,
      propertyType,
      bedrooms,
      bathrooms,
      amenities,
      description,
    } = req.body;

    const imageFiles = req.files || [];
    const imageDetails = [];

    // Validation regex patterns
    const consecutiveSymbolsRegex = /([!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,})/;
    const validStringRegex = /^[a-zA-Z0-9\s,]+$/;

    // Validation errors
    const errors = [];

    // Validate input fields
    if (!name || typeof name !== 'string' || name.trim().length < 3 || consecutiveSymbolsRegex.test(name) || !validStringRegex.test(name)) {
      errors.push('Name is required, must be at least 3 characters long, and should not contain consecutive symbols.');
    }

    if (!location || typeof location !== 'string' || location.trim().length < 5 || consecutiveSymbolsRegex.test(location) || !validStringRegex.test(location)) {
      errors.push('Location is required, must be at least 5 characters long, and can only contain letters, numbers, spaces, and commas without consecutive symbols.');
    }

    if (!price || isNaN(price) || price <= 0) {
      errors.push('Price is required and must be a positive number.');
    }

    const validPropertyTypes = ['apartment', 'house', 'condo', 'townhouse']; // Make all types lowercase for comparison
    if (!propertyType || !validPropertyTypes.includes(propertyType.toLowerCase())) {
      errors.push(`Property type is required and must be one of the following: ${validPropertyTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ')}.`);
    }

    if (!bedrooms || isNaN(bedrooms) || bedrooms < 1) {
      errors.push('Number of bedrooms is required and must be at least 1.');
    }

    if (!bathrooms || isNaN(bathrooms) || bathrooms < 1) {
      errors.push('Number of bathrooms is required and must be at least 1.');
    }

    if (amenities && (consecutiveSymbolsRegex.test(amenities) || !amenities.split(',').every(item => validStringRegex.test(item.trim())))) {
      errors.push('Amenities must be a comma-separated list of strings without consecutive symbols.');
    }

    if (description && (typeof description !== 'string' || description.length > 500 || consecutiveSymbolsRegex.test(description))) {
      errors.push('Description must be a string, no longer than 500 characters, and should not contain consecutive symbols.');
    }

    // Return errors if any validation fails
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if the property already exists
    const existingProperty = await propertyModel.findOne({
      name: name,
      location: location,
      listedBy: userId
    });

    if (existingProperty) {
      return res.status(400).json({ message: 'A property with the same name and location already exists for this landlord.' });
    }

    // Upload images to Cloudinary concurrently and handle file deletion
    const uploadPromises = imageFiles.map(file =>
      cloudinary.uploader.upload(file.path, { folder: 'properties' })
        .then(result => imageDetails.push({
          pictureId: result.public_id,
          pictureUrl: result.secure_url
        }))
        .catch(err => {
          console.error("Error uploading image:", err.message);
          // Optionally handle the error by returning a response or logging
        })
        .finally(() => {
          // Remove the uploaded file from local storage after each upload
          fileSystem.unlink(file.path, (error) => {
            if (error) {
              console.error("Error deleting file from server:", error.message);
            }
          });
        })
    );

    await Promise.all(uploadPromises);

    // Create new property
    const newProperty = new propertyModel({
      name,
      location,
      price,
      propertyType,
      bedrooms,
      bathrooms,
      amenities: amenities ? amenities.split(',').map(item => item.trim()) : [],
      description,
      images: imageDetails,
      listedBy: landlord._id
    });

    await newProperty.save();

    // Update landlord with the new property ID
    landlord.properties.push(newProperty._id);
    await landlord.save();

    // Send confirmation email to landlord
    const mailOptions = {
      to: landlord.email,
      subject: 'Property Listed Successfully',
      text: `Dear ${landlord.firstName},\n\nYour property "${name}" located at "${location}" has been listed successfully.\n\nDetails:\n- Price: ${price}\n- Property Type: ${propertyType}\n- Bedrooms: ${bedrooms}\n- Bathrooms: ${bathrooms}\n- Amenities: ${amenities ? amenities.split(',').map(item => item.trim()).join(', ') : 'None'}\n- Description: ${description || 'No description provided'}\n\nThank you for using our platform.\n\nBest regards,\nThe RentWave Team`,
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Property Listing Confirmation - RentWave</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f0f4f8; /* Light background for contrast */
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #d0dbe1;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            background-color: #ffff; /* Clean white background */
        }
        .header {
            background: #5F92DF; /* Royal Blue */
            padding: 15px;
            display: flex;
            align-items: center; /* Align items vertically */
            justify-content: center; /* Center content horizontally */
            position: relative; /* Allows positioning of the logo */
            border-bottom: 2px solid #5F92DF; /* Darker shade of Royal Blue */
            color: #f4f4f4;
            border-radius: 10px 10px 0 0; /* Rounded top corners */
        }
        .header img {
            width: 120px;
            height: 100px;
            object-fit: contain;
            position: absolute;
            left: 15px; /* Position logo on the left */
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .footer {
            background: #5F92DF; /* Darker shade of Royal Blue */
            padding: 15px;
            text-align: center;
            border-top: 2px solid #5F92DF; /* Royal Blue */
            font-size: 0.9em;
            color: #f4f4f4;
            border-radius: 0 0 10px 10px; /* Rounded bottom corners */
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
            <h1>Property Listing Confirmation</h1>
        </div>
        <div class="content">
            <p>Dear ${landlord.firstName},</p>
            <p>Your property "<strong>${name}</strong>" located at "<strong>${location}</strong>" has been listed successfully.</p>
            <p><strong>Details:</strong></p>
            <ul>
                <li><strong>Price:</strong> ${price}</li>
                <li><strong>Property Type:</strong> ${propertyType}</li>
                <li><strong>Bedrooms:</strong> ${bedrooms}</li>
                <li><strong>Bathrooms:</strong> ${bathrooms}</li>
                <li><strong>Amenities:</strong> ${amenities ? amenities.split(',').map(item => item.trim()).join(', ') : 'None'}</li>
                <li><strong>Description:</strong> ${description || 'No description provided'}</li>
            </ul>
            <p>Thank you for using our platform.</p>
            <p>Best regards,<br>The RentWave Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
    };

    await sendMail(mailOptions);

    res.status(201).json({
      message: 'Property listed successfully',
      property: newProperty
    });
  } catch (error) {
    console.error('Error creating property:', error.message);
    res.status(500).json({ message: 'Error creating property: ' + error.message });
  }
};




  // Get a single property by ID
  
  // Helper function to filter sensitive landlord details
  const filterLandlordDetails = (landlord) => {
    const {
      password, 
      phoneNumber, 
      isVerified, 
      isAdmin, 
      isSuperAdmin, 
      createdAt, 
      updatedAt, 
      __v, 
      ...filteredLandlord 
    } = landlord._doc;
    return filteredLandlord;
  };
  
  exports.getPropertyById = async (req, res) => {
    try {
      const propertyId = req.params.id;
  
      // Check if the ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.status(400).json({
          message: 'Invalid property ID format'
        });
      }
  
      // Find the property by ID and populate the listedBy field
      const property = await propertyModel.findById(propertyId).populate('listedBy');
  
      // If property is not found, send a 404 response
      if (!property) {
        return res.status(404).json({
          message: 'Property not found'
        });
      }
  
      // Filter the landlord details if listedBy field is populated
      if (property.listedBy) {
        property.listedBy = filterLandlordDetails(property.listedBy);
      }
  
      // Send the property data with the filtered landlord details
      res.status(200).json({
        message: 'Property found',
        data: property
      });
    } catch (error) {
      console.error(`Error fetching property by ID: ${propertyId}. Error: ${error.message}`);
      res.status(500).json({
        message: 'An error occurred while fetching the property',
        error: error.message
      });
    }
  };
  
  
  
  
  
  exports.getAllProperties = async (req, res) => {
    try {
      // Find all properties and populate the listedBy field
      const properties = await propertyModel.find().populate('listedBy');
      
      // If no properties are found, send a 404 response
      if (properties.length === 0) {
        return res.status(404).json({
          message: 'No properties found'
        });
      }
  
      // Transform each property to exclude sensitive details from the landlord
      const transformedProperties = properties.map(property => {
        if (property.listedBy) {
          property.listedBy = filterLandlordDetails(property.listedBy);
        }
        return property;
      });
  
      // Send the properties data with the filtered landlord details
      res.status(200).json({
        message: 'Properties found',
        data: transformedProperties
      });
    } catch (error) {
      // Handle any server errors
      console.error(`Error fetching properties: ${error.message}`);
      res.status(500).json({
        message: 'An error occurred while fetching properties',
        error: error.message
      });
    }
  };
  

  exports.updateProperty = async (req, res) => {
    try {
      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid property ID' });
      }
  
      // Retrieve the existing property
      const existingProperty = await propertyModel.findById(req.params.id);
  
      if (!existingProperty) {
        return res.status(404).json({ message: 'Property not found' });
      }
  
      // Extract data from the request body
      const {
        name,
        location,
        price,
        propertyType,
        bedrooms,
        bathrooms,
        amenities,
        description
      } = req.body;
  
      // Initialize an array to hold validation errors
      const errors = [];
  
      // Utility function to check for empty strings or symbols only
      const isInvalidString = (str) =>
        !str || /^\s*$/.test(str) || /^[!@#$%^&*(),.?":{}|<>-_+=]*$/.test(str) || /([!@#$%^&*(),.?":{}|<>-_+=])\1{1,}/.test(str);
  
      // Validate each field
      if (name && (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 100 || isInvalidString(name))) {
        errors.push('Name must be a valid string between 3 and 100 characters, not empty, and not contain only symbols or consecutive symbols.');
      }
  
      if (location && (typeof location !== 'string' || location.trim().length < 3 || location.trim().length > 200 || isInvalidString(location))) {
        errors.push('Location must be a valid string between 3 and 200 characters, not empty, and not contain only symbols or consecutive symbols.');
      }
  
      if (price && (isNaN(price) || price < 0)) {
        errors.push('Price must be a positive number.');
      }
  
      const validPropertyTypes = ['apartment', 'house', 'condo', 'townhouse'];
      if (propertyType && !validPropertyTypes.includes(propertyType.toLowerCase())) {
        errors.push(`Property type must be one of the following: ${validPropertyTypes.join(', ')}.`);
      }
  
      if (bedrooms && (isNaN(bedrooms) || bedrooms < 1)) {
        errors.push('Bedrooms must be a number greater than or equal to 1.');
      }
  
      if (bathrooms && (isNaN(bathrooms) || bathrooms < 1)) {
        errors.push('Bathrooms must be a number greater than or equal to 1.');
      }
  
      if (amenities && (typeof amenities !== 'string' || amenities.split(',').some(item => isInvalidString(item)))) {
        errors.push('Amenities must be a comma-separated list of valid, non-empty strings without only symbols.');
      }
  
      if (description && (typeof description !== 'string' || description.trim().length > 500 || isInvalidString(description))) {
        errors.push('Description must be a valid string with a maximum length of 500 characters, not empty, and not contain only symbols or consecutive symbols.');
      }
  
      // If any validation errors are found, return a 400 response
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
  
      // Extract image files from the request
      const imageFiles = req.files;
      const imageDetails = [];
  
      // Process new images if any
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'properties'
          });
          imageDetails.push({
            pictureId: result.public_id,
            pictureUrl: result.secure_url
          });
  
          // Remove the uploaded file from local storage after successful upload
          fileSystem.unlink(file.path, (error) => {
            if (error) {
              console.error("Error deleting file from server:", error.message);
            }
          });
        }
      }
  
      // Prepare updated data
      const updatedData = {
        ...(name && { name }),
        ...(location && { location }),
        ...(price && { price }),
        ...(propertyType && { propertyType }),
        ...(bedrooms && { bedrooms }),
        ...(bathrooms && { bathrooms }),
        ...(amenities && { amenities: amenities.split(',').map(item => item.trim()) }),
        ...(description && { description }),
        ...(imageDetails.length > 0 && { images: imageDetails })
      };
  
      // Update the property with new data
      const updatedProperty = await propertyModel.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      ).populate('listedBy', '-isAdmin -isSuperAdmin -password -isVerified -phoneNumber -__v'); // Exclude sensitive fields
  
      // Send a 200 response with the updated property
      res.status(200).json({
        message: 'Property updated successfully',
        data: updatedProperty
      });
    } catch (error) {
      // Handle any errors and send a 400 response
      res.status(400).json({
        error: error.message
      });
    }
  };
  ;





// Delete a property listing
exports.deleteProperty = async (req, res) => {
    try {
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid property ID' });
        }

        // Retrieve the property to get image details
        const property = await propertyModel.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Delete images from Cloudinary if they exist
        if (property.images.length > 0) {
            for (const image of property.images) {
                await cloudinary.uploader.destroy(image.pictureId);
            }
        }

        // Delete the property from the database
        await propertyModel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Property deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};




exports.getAllPropertiesByLandlord = async (req, res) => {
  try {
    const landlordId = req.user.id; // Assuming req.user is populated via authentication middleware

    // Log landlordId for debugging purposes
    console.log('Landlord ID from JWT:', landlordId);

    // Validate landlordId as a valid MongoDB ObjectID
    if (!mongoose.Types.ObjectId.isValid(landlordId)) {
      return res.status(400).json({ message: 'Invalid landlord ID format.' });
    }

    // Find all properties where the landlord matches the logged-in user
    const properties = await propertyModel.find({ listedBy: landlordId });

    if (!properties || properties.length === 0) {
      return res.status(404).json({ message: 'No properties found for this landlord.' });
    }

    res.status(200).json({
      message: 'Properties retrieved successfully.',
      totalNumberOfProperties: properties.length,
      data: properties
      
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      message: 'Error retrieving properties. Please try again later.',
      error: error.message
    });
  }
};
