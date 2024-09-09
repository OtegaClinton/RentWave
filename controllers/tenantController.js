const cloudinary = require("../helpers/cloudinary");
const tenantModel = require('../models/tenantModel'); 
const userModel = require("../models/userModel");
const propertyModel = require("../models/propertyModel");
const maintenanceModel = require("../models/maintenanceModel")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fileSystem = require("fs");
const sendMail=require("../helpers/email");
const mongoose = require('mongoose');




const isInvalidString = (str) => {
  // Check if the string contains only allowed characters
  const hasInvalidChars = /[^a-zA-Z0-9\s]/.test(str);
  // Check if the string has consecutive symbols or is empty
  const hasConsecutiveSymbols = /[\W_]{2,}/.test(str);
  return hasInvalidChars || hasConsecutiveSymbols || str.trim().length === 0;
};

// Main validation function
exports.onboardTenant = async (req, res) => {
  const errors = [];

  try {
    // Extract the necessary fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      propertyId,
      leaseStart,
      leaseEnd
    } = req.body;

    // Validate each field
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 3 || firstName.trim().length > 100 || isInvalidString(firstName)) {
      errors.push('First name must be a valid string between 3 and 100 characters, not empty, and not contain only symbols or consecutive symbols.');
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 3 || lastName.trim().length > 100 || isInvalidString(lastName)) {
      errors.push('Last name must be a valid string between 3 and 100 characters, not empty, and not contain only symbols or consecutive symbols.');
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format.');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length !== 11) {
      errors.push('Phone number must be exactly 11 characters long.');
    }
    
    if (!propertyId || typeof propertyId !== 'string') {
      errors.push('Property ID is required and must be a string.');
    }

    if (!leaseStart || isNaN(new Date(leaseStart).getTime())) {
      errors.push('Lease start date is required and must be a valid date.');
    }

    if (!leaseEnd || isNaN(new Date(leaseEnd).getTime()) || new Date(leaseStart) >= new Date(leaseEnd)) {
      errors.push('Lease end date is required and must be a valid date after the lease start date.');
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Retrieve landlordId from the authenticated user
    const landlordId = req.user.id;

    // Check if the landlord exists
    const landlord = await userModel.findById(landlordId);
    if (!landlord) {
      return res.status(404).json({ message: 'Landlord not found.' });
    }

    // Check if the property exists
    const property = await propertyModel.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    // Check if a tenant with the provided email or phone number already exists
    const existingTenant = await tenantModel.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingTenant) {
      return res.status(400).json({ 
        message: 'A tenant with this email or phone number already exists. Please use a different email or phone number.' 
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new tenant instance
    const newTenant = new tenantModel({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      landlord: landlordId,
      property: propertyId,
      leaseStart,
      leaseEnd,
    });

    // Save the new tenant to the database
    await newTenant.save();

    // Push tenant ID to landlord's tenants list
    await userModel.findByIdAndUpdate(
      landlordId,
      { $push: { tenants: newTenant._id } },
      { new: true }
    );

    // Push tenant ID to property's tenants list
    await propertyModel.findByIdAndUpdate(
      propertyId,
      { $push: { tenants: newTenant._id } },
      { new: true }
    );

    // Return a success response
    res.status(201).json({ message: 'Tenant onboarded successfully.', tenant: newTenant });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      // Handle validation errors
      res.status(400).json({ message: 'Validation error.', error: error.errors });
    } else if (error.code === 11000) {
      // Handle duplicate key error with a user-friendly message
      res.status(400).json({ 
        message: 'A tenant with this email or phone number already exists. Please use a different email or phone number.' 
      });
    } else {
      // Handle general errors
      console.error('Error onboarding tenant:', error);
      res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
  }
};





// Helper function to get the redirect URL based on role
const getDashboardUrl = (role) => {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard';
    case 'Landlord':
      return '/landlord/dashboard';
    case 'Tenant':
      return '/tenant/dashboard';
    default:
      return '/dashboard'; // Default or unknown role
  }
};

exports.tenantLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find the tenant by email
    const tenant = await tenantModel.findOne({ email: email.toLowerCase() });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found. Invalid email or password.' });
    }

    // Check if tenant is verified
    if (!tenant.isVerified) {
      return res.status(403).json({ message: 'Please verify your email to log in.' });
    }

    // Verify the password
    const isPasswordCorrect = await bcrypt.compare(password, tenant.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    // Generate a JWT token including tenant details
    const token = jwt.sign(
      { id: tenant._id, email: tenant.email, role: tenant.role }, // Include role in payload
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Exclude sensitive information from the response
    const { 
      password: tenantPassword, 
      isVerified, 
      __v, 
      updatedAt, 
      createdAt, 
      phoneNumber, 
      ...tenantDetails 
    } = tenant._doc;

    // Determine the appropriate redirection URL based on role
    const redirectUrl = getDashboardUrl(tenant.role);

    // Respond with success, token, and redirection URL
    res.status(200).json({
      message: 'Login successful.',
      data: tenantDetails,
      token: token,
      redirectUrl: redirectUrl
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error logging in.',
      error: error.message
    });
  }
};





// Main update function
exports.updateTenantProfile = async (req, res) => {
  try {
    const tenantId = req.user.id; // Assumes `req.user.id` is set by authentication middleware

    // Extract fields from the request body
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      dateOfBirth, 
      gender, 
      fullAddress, 
      country, 
      state, 
      landmark 
    } = req.body;

    // Validate fields
    const errors = [];

    // Validate first name
    if (firstName && (typeof firstName !== 'string' || firstName.trim().length < 3 || firstName.trim().length > 100 || isInvalidString(firstName))) {
      errors.push('First name must be a valid string between 3 and 100 characters, not empty, and not contain only symbols or consecutive symbols.');
    }

    // Validate last name
    if (lastName && (typeof lastName !== 'string' || lastName.trim().length < 3 || lastName.trim().length > 100 || isInvalidString(lastName))) {
      errors.push('Last name must be a valid string between 3 and 100 characters, not empty, and not contain only symbols or consecutive symbols.');
    }

    // Validate email
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      errors.push('Invalid email format.');
    }

    // Validate phone number
    if (phoneNumber && (phoneNumber.length !== 11 || !/^[0-9]{11}$/.test(phoneNumber))) {
      errors.push('Phone number must be exactly 11 characters long.');
    }

    // Validate date of birth
    if (dateOfBirth && isNaN(Date.parse(dateOfBirth))) {
      errors.push('Date of birth must be a valid date.');
    }

    // Validate gender
    if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
      errors.push('Gender must be either Male, Female, or Other.');
    }

    // Validate full address
    if (fullAddress && (typeof fullAddress !== 'string' || fullAddress.trim().length < 5 || fullAddress.trim().length > 200)) {
      errors.push('Full address must be a valid string between 5 and 200 characters.');
    }

    // Validate country
    if (country && (typeof country !== 'string' || country.trim().length < 2 || country.trim().length > 100)) {
      errors.push('Country must be a valid string between 2 and 100 characters.');
    }

    // Validate state
    if (state && (typeof state !== 'string' || state.trim().length < 2 || state.trim().length > 100)) {
      errors.push('State must be a valid string between 2 and 100 characters.');
    }

    // Validate landmark
    if (landmark && (typeof landmark !== 'string' || landmark.trim().length < 2 || landmark.trim().length > 100)) {
      errors.push('Landmark must be a valid string between 2 and 100 characters.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if the new email already exists in the database
    if (email) {
      const existingTenantByEmail = await tenantModel.findOne({
        email: email.toLowerCase()
      });

      if (existingTenantByEmail) {
        return res.status(400).json({ message: 'Email already in use by another tenant.' });
      }
    }

    // Check if the new phone number already exists in the database
    if (phoneNumber) {
      const existingTenantByPhone = await tenantModel.findOne({
        phoneNumber: phoneNumber
      });

      if (existingTenantByPhone) {
        return res.status(400).json({ message: 'Phone number already in use by another tenant.' });
      }
    }
    
    // Create an object with fields that can be updated
    const updateData = {};

    // Update fields only if they are provided
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email.toLowerCase();
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender) updateData.gender = gender;
    if (fullAddress) updateData.fullAddress = fullAddress;
    if (country) updateData.country = country;
    if (state) updateData.state = state;
    if (landmark) updateData.landmark = landmark;

    // Ensure a file has been uploaded for profile picture
    if (req.file) {
      try {
        // Upload new profile picture to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'tenant_profile_pictures'
        });

        // Update profile picture in the data
        updateData.profilePicture = {
          pictureId: result.public_id,
          pictureUrl: result.secure_url
        };

        // Remove the uploaded file from local storage after successful upload
        fileSystem.unlink(req.file.path, (error) => {
          if (error) {
            console.error("Error deleting file from server:", error.message);
          }
        });

      } catch (uploadError) {
        // Handle Cloudinary upload error
        return res.status(400).json({
          message: "Error uploading profile picture.",
          error: uploadError.message
        });
      }
    }

    // Update tenant information
    const updatedTenant = await tenantModel.findByIdAndUpdate(tenantId, updateData, { new: true });

    if (!updatedTenant) {
      return res.status(404).json({
        message: "Tenant not found."
      });
    }

    // Exclude sensitive information
    const { password, __v, isVerified, createdAt, updatedAt, ...tenantDetails } = updatedTenant._doc;

    res.status(200).json({
      message: "Tenant profile updated successfully.",
      tenant: tenantDetails
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating tenant profile.",
      error: error.message
    });
  }
};





exports.addProfilePictureTenant = async (req, res) => {
  try {
    // Get the tenant ID from the authenticated user
    const tenantId = req.user.id; 

    // Ensure a file has been uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: "No file uploaded." 
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'tenant_profile_pictures'
     
    });

    // Remove the uploaded file from local storage after successful upload
    fileSystem.unlink(req.file.path, (error) => {
      if (error) {
        console.error("Error deleting file from server:", error.message);
      }
    });

    // Find the tenant and update the profile picture details
    const tenant = await tenantModel.findByIdAndUpdate(
      tenantId,
      {
        profilePicture: {
          pictureId: result.public_id,
          pictureUrl: result.secure_url
        }
      },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ 
        message: "Tenant not found." 
      });
    }

    // Successful response
    res.status(200).json({ 
      message: "Profile picture updated successfully.", 
      tenant 
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error); 
    res.status(500).json({ 
      message: "Error uploading profile picture", 
      error: error.message 
    });
  }
};





exports.updateProfilePicture = async (req, res) => {
  try {
    const tenantId = req.user.id; // Assumes `req.user.id` is set by authentication middleware

    // Ensure a file has been uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: "No file uploaded." 
      });
    }

    // Upload new profile picture to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'tenant_profile_pictures'
    });

    // Remove the uploaded file from local storage after successful upload
    fileSystem.unlink(req.file.path, (error) => {
      if (error) {
        console.error("Error deleting file from server:", error.message);
      }
    });

    // Find the tenant and update the profile picture details
    const tenant = await tenantModel.findByIdAndUpdate(
      tenantId,
      {
        profilePicture: {
          pictureId: result.public_id,
          pictureUrl: result.secure_url
        }
      },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ 
        message: "Tenant not found." 
      });
    }

    res.status(200).json({ 
      message: "Profile picture updated successfully.", 
      profilePicture: tenant.profilePicture
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating profile picture.", 
      error: error.message 
    });
  }
};




exports.changePassword = async (req, res) => {
  try {
    const tenantId = req.user.id; // Assumes `req.user.id` is set by authentication middleware

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both current and new passwords are required."
      });
    }

    // Find the tenant
    const tenant = await tenantModel.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found."
      });
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, tenant.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect."
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    tenant.password = hashedPassword;
    await tenant.save();

    res.status(200).json({
      message: "Password updated successfully."
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating password.",
      error: error.message
    });
  }
};


exports.createMaintenanceRequest = async (req, res) => {
  try {
    const tenantId = req.user.id; // Assuming `req.user.id` is set by authentication middleware

    // Validate tenant existence
    const tenant = await tenantModel.findById(tenantId).populate('property');
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    // Extract fields from the request body
    const { requestFor, additionalInfo, availableDates, phoneNumber } = req.body;

    // Validate required fields
    if (!requestFor || typeof requestFor !== 'string' || requestFor.trim().length < 5) {
      return res.status(400).json({
        message: 'Request description must be a valid string with at least 5 characters.'
      });
    }

    if (!availableDates || !Array.isArray(availableDates) || availableDates.length !== 3) {
      return res.status(400).json({
        message: 'Please provide exactly three dates for availability.'
      });
    }

    if (!phoneNumber || !/^[0-9]{11}$/.test(phoneNumber)) {
      return res.status(400).json({
        message: 'Phone number must be exactly 11 digits.'
      });
    }

    // Handle picture uploads, if any
    let pictures = [];
    const uploadedFiles = []; // To keep track of uploaded files for deletion

    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'maintenance_request_pictures'
          });
          pictures.push({
            pictureId: result.public_id,
            pictureUrl: result.secure_url
          });
          uploadedFiles.push(file.path); // Track the uploaded file paths
        }
      } catch (uploadError) {
        // Clean up uploaded files if there's an error
        uploadedFiles.forEach(filePath => {
          fileSystem.unlink(filePath, (error) => {
            if (error) {
              console.error(`Error deleting file from server: ${filePath}`, error.message);
            }
          });
        });

        return res.status(400).json({
          message: "Error uploading pictures.",
          error: uploadError.message
        });
      }
    }

    // Create a new maintenance request
    const newMaintenanceRequest = new maintenanceModel({
      tenant: tenantId,
      property: tenant.property,
      requestFor: requestFor.trim(),
      additionalInfo: additionalInfo ? additionalInfo.trim() : '',
      availableDates,
      phoneNumber,
      pictures
    });

    await newMaintenanceRequest.save();

    // Find landlord's email
    const landlord = await userModel.findById(tenant.landlord);
    if (!landlord) {
      return res.status(404).json({ message: 'Landlord not found' });
    }

    // Check if landlord email exists
    if (!landlord.email) {
      return res.status(400).json({ message: 'Landlord does not have a registered email address' });
    }

    // Compose email content
    const emailContent = `
      <p>Dear ${landlord.firstName} ${landlord.lastName},</p>
      <p>A maintenance request has been submitted for the property you manage.</p>
      <p><strong>Request Description:</strong> ${requestFor}</p>
      <p><strong>Additional Information:</strong> ${additionalInfo || 'None'}</p>
      <p><strong>Available Dates:</strong> ${availableDates.join(', ')}</p>
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <p>Please review the request and take appropriate action.</p>
      <p>Best regards,</p>
      <p>Your Property Management System,</p>
      <p>RentWave.</p>
    `;

    // Log email content for debugging
    console.log('Sending email to:', landlord.email);
    console.log('Email content:', emailContent);

    // Send email to landlord
    await sendMail({
      to: landlord.email,
      subject: 'New Maintenance Request Submitted',
      html: emailContent
    });

    res.status(201).json({
      message: 'Maintenance request created successfully and email sent to landlord.',
      maintenanceRequest: newMaintenanceRequest
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating maintenance request.',
      error: error.message
    });
  }
};





exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { requestId } = req.params; 
    const { status } = req.body; 

    // Validate status input
    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Status must be "Pending", "In Progress", or "Completed".'
      });
    }

    // Find the maintenance request by ID
    const maintenanceRequest = await maintenanceModel.findById(requestId);
    if (!maintenanceRequest) {
      return res.status(404).json({ message: "Maintenance request not found." });
    }

    // Update the status and completion date if the status is "Completed"
    maintenanceRequest.status = status;
    if (status === 'Completed') {
      maintenanceRequest.completionDate = new Date();
    }

    await maintenanceRequest.save();

    res.status(200).json({
      message: 'Maintenance request status updated successfully.',
      maintenanceRequest
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating maintenance request status.',
      error: error.message
    });
  }
};
