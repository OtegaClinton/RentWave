const cloudinary = require("../helpers/cloudinary");
const tenantModel = require('../models/tenantModel'); 
const userModel = require("../models/userModel");
const propertyModel = require("../models/propertyModel");
const maintenanceModel = require("../models/maintenanceModel")
const paymentModel = require('../models/paymentModel'); // Assuming you have a payment mode
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fileSystem = require("fs");
const sendMail=require("../helpers/email");
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
// const fs = require('fs');
const fs = require('fs').promises; 




const isInvalidString = (str) => {
  // Allow letters, numbers, spaces, commas, hyphens, and apostrophes, but check for consecutive symbols or empty strings
  const hasInvalidChars = /[^a-zA-Z0-9\s,'-]/.test(str);
  const hasConsecutiveSymbols = /[\W_]{2,}/.test(str);
  return hasInvalidChars || hasConsecutiveSymbols || str.trim().length === 0;
};

exports.onboardTenant = async (req, res) => {
  const errors = [];

  try {
    // Extract and trim fields from request body
    let {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      propertyId,
      leaseStart,
      leaseEnd,
    } = req.body;

    firstName = firstName.trim();
    lastName = lastName.trim();
    email = email.trim().toLowerCase();
    phoneNumber = phoneNumber.trim();
    leaseStart = leaseStart.trim();
    leaseEnd = leaseEnd.trim();

    // Validate each field
    if (!firstName || typeof firstName !== 'string' || firstName.length < 3 || firstName.length > 100 || isInvalidString(firstName)) {
      errors.push('First name must be a valid string between 3 and 100 characters, not empty, and should not contain consecutive symbols.');
    }

    if (!lastName || typeof lastName !== 'string' || lastName.length < 3 || lastName.length > 100 || isInvalidString(lastName)) {
      errors.push('Last name must be a valid string between 3 and 100 characters, not empty, and should not contain consecutive symbols.');
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format.');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || !/^\d{11}$/.test(phoneNumber)) {
      errors.push('Phone number must be exactly 11 digits long.');
    }

    if (!propertyId || typeof propertyId !== 'string') {
      errors.push('Property ID is required and must be a string.');
    }

    const start = new Date(leaseStart);
    const end = new Date(leaseEnd);

    // Ensure dates are valid and not in the past
    const today = new Date();
    if (!leaseStart || isNaN(start.getTime()) || start < today) {
      errors.push('Lease start date is required, must be a valid date, and cannot be in the past.');
    }

    if (!leaseEnd || isNaN(end.getTime()) || start >= end) {
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

    // Check if the property has a landlord and if it matches the authenticated landlord
    if (!property.listedBy || property.listedBy.toString() !== landlordId.toString()) {
      return res.status(403).json({ message: 'You cannot onboard a tenant to a property that you do not own.' });
    }

    // Check if a tenant with the provided email or phone number already exists
    const existingTenant = await tenantModel.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingTenant) {
      return res.status(400).json({
        message: 'A tenant with this email or phone number already exists. Please use a different email or phone number.',
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new tenant instance
    const newTenant = new tenantModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      landlord: landlordId,
      property: propertyId,
      leaseStart,
      leaseEnd,
    });

    // Save the new tenant to the database
    await newTenant.save();

    // Update landlord and property records with the new tenant ID
    await userModel.findByIdAndUpdate(landlordId, { $push: { tenants: newTenant._id } }, { new: true });
    await propertyModel.findByIdAndUpdate(propertyId, { $push: { tenants: newTenant._id },$set: { isAvailable: false } }, { new: true });

    // Send an email to the tenant
    const emailOptions = {
      to: email,
      subject: 'Welcome to RentWave!',
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Tenant Onboarding - RentWave</title>
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
        .button {
            display: inline-block;
            background-color: #5F92DF; /* Royal Blue */
            color: #f4f4f4;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #002a80; /* Darker shade of Royal Blue */
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
            <h1>Welcome to RENTWAVE!</h1>
        </div>
        <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            <p>Welcome to RentWave! We are excited to inform you that you have been successfully onboarded as a tenant in our community.</p>
            <p>Your account has been created, and you can now access your RentWave tenant portal using the login credentials below:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>For your security, please change your password upon your first login to keep your account secure.</p>
            <p>If you have any questions or need assistance, our support team is here to help you at any time.</p>
            <p>Thank you for choosing RentWave. We look forward to making your rental experience smooth and enjoyable.</p>
            <p>Best regards,<br>RentWave Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,
    };

    await sendMail(emailOptions);

    // Return a success response
    res.status(201).json({ message: 'Tenant onboarded successfully.', tenant: newTenant });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: 'Validation error.', error: error.errors });
    } else if (error.code === 11000) {
      res.status(400).json({
        message: 'A tenant with this email or phone number already exists. Please use a different email or phone number.',
      });
    } else {
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






const downloadImage = async (url, filePath) => {
  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
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
        const { requestFor, additionalInfo, availableDates } = req.body;

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

        // Validate each available date object (date and time)
        for (const dateObj of availableDates) {
            if (!dateObj.date || !dateObj.time) {
                return res.status(400).json({
                    message: 'Each available date must include both date and time.'
                });
            }

            // Validate time format (HH:mm)
            const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(dateObj.time)) {
                return res.status(400).json({
                    message: 'Each time must be in the format HH:mm.'
                });
            }
        }

        // Use the tenant's phone number directly
        const phoneNumber = tenant.phoneNumber;

        // Handle picture uploads, if any
        let pictures = [];
        const imageUrls = [];
        const maxImages = 3;
        const attachmentFiles = [];

        // If files are uploaded
        if (req.files && Array.isArray(req.files)) {
            if (req.files.length > maxImages) {
                return res.status(400).json({ message: `You can upload a maximum of ${maxImages} images.` });
            }

            try {
                for (const file of req.files) {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'maintenance_request_pictures'
                    });
                    pictures.push({
                        pictureId: result.public_id,
                        pictureUrl: result.secure_url
                    });
                    imageUrls.push(result.secure_url); // Store URLs for downloading

                    // Prepare local file for attachment
                    attachmentFiles.push({
                        filename: path.basename(file.path),
                        path: file.path
                    });
                }
            } catch (uploadError) {
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

        if (!landlord.email) {
            return res.status(400).json({ message: 'Landlord does not have a registered email address' });
        }

        // Format available dates with time
        const formattedDates = availableDates.map(dateObj => `${new Date(dateObj.date).toLocaleDateString()} at ${dateObj.time}`);

        // Compose email content
        const emailContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Maintenance Request Notification - RentWave</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f0f4f8;
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
            background-color: #ffff;
        }
        .header {
            background: #5F92DF;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            border-bottom: 2px solid #5F92DF;
            color: #f4f4f4;
            border-radius: 10px 10px 0 0;
        }
        .header img {
            width: 120px;
            height: 100px;
            object-fit: contain;
            position: absolute;
            left: 15px;
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .footer {
            background: #5F92DF;
            padding: 15px;
            text-align: center;
            border-top: 2px solid #5F92DF;
            font-size: 0.9em;
            color: #f4f4f4;
            border-radius: 0 0 10px 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
            <h1>Maintenance Request Notification</h1>
        </div>
        <div class="content">
            <p>Dear ${landlord.firstName} ${landlord.lastName},</p>
            <p>A maintenance request has been submitted for the property you manage.</p>
            <p><strong>Request Description:</strong> ${requestFor}</p>
            <p><strong>Additional Information:</strong> ${additionalInfo || 'None'}</p>
            <p><strong>Available Dates:</strong> ${formattedDates.join(', ')}</p>
            <p><strong>Phone Number:</strong> ${phoneNumber}</p>
            <p>Please review the request and take appropriate action.</p>
            <p>Best regards,<br>Your Property Management System,<br>RentWave</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

        console.log('Sending email to:', landlord.email);
        console.log('Email content:', emailContent);

        // Send email with attachments
        await sendMail({
            to: landlord.email,
            subject: 'New Maintenance Request Submitted',
            html: emailContent,
            attachments: attachmentFiles
        });

        // Clean up temporary files after sending email
        await Promise.all(attachmentFiles.map(async file => {
            try {
                await fs.unlink(file.path);
                console.log(`Successfully deleted temp file: ${file.path}`);
            } catch (unlinkError) {
                console.error(`Error deleting temp file: ${file.path}`, unlinkError.message);
            }
        }));

        res.status(201).json({
            message: 'Maintenance request created successfully and email sent to landlord with attachments.',
            maintenanceRequest: newMaintenanceRequest
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating maintenance request.',
            error: error.message
        });
    }
};



exports.getAllSingleTenantMaintenanceRequests = async (req, res) => {
  try {
    const tenantId = req.user.id; // Assumes req.user is populated via authentication middleware

    // Log tenantId for debugging
    console.log('Tenant ID from JWT:', tenantId);

    // Validate tenantId as a valid MongoDB ObjectID
    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({ message: 'Invalid tenant ID format.' });
    }

    // Find all maintenance requests for the logged-in tenant
    const maintenanceRequests = await maintenanceModel.find({ tenant: tenantId });

    if (maintenanceRequests.length === 0) {
      return res.status(404).json({ message: 'No maintenance requests found for this tenant.' });
    }

    res.status(200).json({
      message: 'Maintenance requests retrieved successfully.',
      data: maintenanceRequests,
      totalNumberOfMaintenanceRequests: maintenanceRequests.length,
    });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({
      message: 'Error retrieving maintenance requests. Please try again later.',
      error: error.message,
    });
  }
};




exports.getTenantPayments = async (req, res) => {
  try {
    const tenantId = req.user.id;

    // Log tenantId for debugging
    console.log('Tenant ID from JWT:', tenantId);

    // Convert tenantId to ObjectId correctly
    const objectId = new mongoose.Types.ObjectId(tenantId);

    // Find all payments for the logged-in tenant
    const payments = await paymentModel.find({ tenant: objectId });

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: 'No payments found for this tenant.' });
    }

    res.status(200).json({
      message: 'Payments retrieved successfully.',
      data: payments,
      totalNumberOfPayments: payments.length,
    });
  } catch (error) {
    console.error('Error retrieving payments:', error);
    res.status(500).json({
      message: 'Error retrieving payments. Please try again later.',
      error: error.message,
    });
  }
};
