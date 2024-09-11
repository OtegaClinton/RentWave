const userModel = require("../models/userModel");
const propertyModel = require("../models/propertyModel");
const tenantModel = require('../models/tenantModel'); 
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt =require("jsonwebtoken");
const sendMail=require("../helpers/email");
const {html,reverifyHtml} = require("../helpers/html");
const cloudinary = require("../helpers/cloudinary");
const fileSystem = require("fs");


exports.signUp = async (req, res) => {
  try {
    let {
      firstName = '',
      lastName = '',
      email = '',
      password = '',
      confirmPassword = '',
      phoneNumber = ''
    } = req.body;

    // Check for undefined or null values
    if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof email !== 'string' || typeof password !== 'string' || typeof confirmPassword !== 'string' || typeof phoneNumber !== 'string') {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Trim and sanitize input
    firstName = firstName.trim();
    lastName = lastName.trim();
    email = email.trim().toLowerCase();
    phoneNumber = phoneNumber.trim();

    // Log trimmed values for debugging
    console.log('Trimmed Values:', { firstName, lastName, email, phoneNumber });

    // Define regex patterns
    const consecutiveSymbolsPattern = /([!@#$%^&*()_+={}\[\]:;"'<>,.?/\\-])\1{2,}/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneNumberPattern = /^\d{11}$/;
    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\-]).{6,}$/;

    // Check for consecutive symbols in all inputs
    if (consecutiveSymbolsPattern.test(firstName)) {
      return res.status(400).json({ message: 'First name contains consecutive symbols. Please avoid repeating special characters.' });
    }
    if (consecutiveSymbolsPattern.test(lastName)) {
      return res.status(400).json({ message: 'Last name contains consecutive symbols. Please avoid repeating special characters.' });
    }
    if (consecutiveSymbolsPattern.test(email)) {
      return res.status(400).json({ message: 'Email contains consecutive symbols. Please avoid repeating special characters.' });
    }
    if (consecutiveSymbolsPattern.test(password)) {
      return res.status(400).json({ message: 'Password contains consecutive symbols. Please avoid repeating special characters.' });
    }
    if (consecutiveSymbolsPattern.test(confirmPassword)) {
      return res.status(400).json({ message: 'Confirm password contains consecutive symbols. Please avoid repeating special characters.' });
    }
    if (consecutiveSymbolsPattern.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number contains consecutive symbols. Please avoid repeating special characters.' });
    }

    // Validate input
    if (firstName.length < 3) {
      return res.status(400).json({ message: 'First name must be at least 3 characters long' });
    }
    if (lastName.length < 3) {
      return res.status(400).json({ message: 'Last name must be at least 3 characters long' });
    }
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'Invalid email address format. Please provide a valid email address.' });
    }
    if (!passwordPattern.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long, contain at least one uppercase letter, and one special character.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match. Please ensure both password fields match.' });
    }
    if (!phoneNumberPattern.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be exactly 11 digits long.' });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email is already in use. Please use a different email address.' });
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return res.status(400).json({ message: 'Phone number is already in use. Please use a different phone number.' });
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber
    });

    // Save the user to the database
    await newUser.save();

    // Generate a JWT token
    const userToken = jwt.sign(
      { id: newUser._id, email: newUser.email, firstName: newUser.firstName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Construct the verification link
    const verifyLink = `${req.protocol}://${req.get('host')}/api/v1/verify/${newUser._id}/${userToken}`;

    // Send verification email
    await sendMail({
      subject: 'Kindly verify your email.',
      to: newUser.email,
      html: html(verifyLink, newUser.firstName)
    });

    res.status(201).json({
      message: `Welcome ${newUser.firstName}, kindly check your email to verify your email address.`,
      data: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      }
    });
  } catch (error) {
    console.error('Error during sign-up:', error); // Log the error details
    if (error.code === 11000) {
      // Handle duplicate key errors
      const field = Object.keys(error.keyValue)[0]; // Get the field that caused the error
      const value = Object.values(error.keyValue)[0]; // Get the value of the field

      return res.status(400).json({
        message: `Duplicate key error: ${field} '${value}' already exists. Please use a different ${field}.`
      });
    }

    res.status(500).json({
      message: 'An unexpected error occurred. Please try again later.',
      error: error.message 
    });
  }
};




exports.verifyEmail = async (req, res) => {
  try {
    const { id, token } = req.params;
    const findUser = await userModel.findById(id);

    if (!findUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
      if (error) {
        const verifyLink = `${req.protocol}://${req.get('host')}/api/v1/newemail/${findUser._id}`;
        await sendMail({
          subject: 'Kindly Verify your mail',
          to: findUser.email,
          html: html(verifyLink, findUser.firstName)
        });
        return res.status(400).json({
          message: 'This link has expired, kindly check your email for a new link'
        });
      }

      // Check if user is already verified
      if (findUser.isVerified) {
        return res.status(400).json({
          message: 'Your account has already been verified'
        });
      }

      // Update the user's verification status
      findUser.isVerified = true;
      await findUser.save();

      return res.status(200).json({
        message: 'Email verified successfully'
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};




exports.newEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided in the request body
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Normalize the email input
    const normalizedEmail = email.toLowerCase();

    // Find the user by the provided email
    const user = await userModel.findOne({ email: normalizedEmail });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a token
    const userToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } 
    );

    // Create the verification link
    const reverifyLink = `${req.protocol}://${req.get('host')}/api/v1/verify/${user._id}/${userToken}`;

    // Send the email
    await sendMail({
      subject: 'Kindly verify your email',
      to: user.email,
      html: reverifyHtml(reverifyLink, user.firstName)
    });

    // Respond with success
    res.status(200).json({
      message: 'Verification email sent'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};




// Helper function to get the redirect URL based on role
const getDashboardUrl = (role, isAdmin, isSuperAdmin) => {
  if (isSuperAdmin) {
    return '/admin/dashboard'; // Redirect Super Admins to the Admin dashboard
  }
  
  if (isAdmin) {
    return '/admin/dashboard'; // Redirect Admins to the Admin dashboard
  }
  
  switch (role) {
    case 'Landlord':
      return '/landlord/dashboard';
    case 'Tenant':
      return '/tenant/dashboard';
    default:
      return '/dashboard'; // Default or unknown role
  }
};


exports.logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Normalize email to lower case
    const normalizedEmail = email.toLowerCase();

    // Check if the user exists
    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password.' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email to log in.' });
    }

    // Verify the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token including the user role
    const token = jwt.sign(
      { id: user._id, role: user.role, isAdmin: user.isAdmin, isSuperAdmin: user.isSuperAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Exclude sensitive fields from response
    const {
      password: userPassword,
      isVerified,
      phoneNumber,
      createdAt,
      updatedAt,
      __v,
      ...otherDetails
    } = user._doc;

    // Determine the appropriate redirection URL based on role and admin status
    const redirectUrl = getDashboardUrl(user.role, user.isAdmin, user.isSuperAdmin);

    res.status(200).json({
      message: 'Login successful.',
      data: otherDetails,
      token: token,
      redirectUrl: redirectUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
  }
};





const hasConsecutiveSymbols = (str) => {
  return /[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\-]{2,}/.test(str);
};


// Helper function to validate input data
const validateUserData = (data) => {
  const errors = [];
  // Add validations similarly as above but modular
  // ...validation code here...
  return errors;
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      fullAddress,
      country,
      state,
      landmark,
    } = req.body;

    // Trim and sanitize input
    const data = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      phoneNumber: phoneNumber?.trim(),
      dateOfBirth: dateOfBirth?.trim(),
      gender: gender?.trim(),
      fullAddress: fullAddress?.trim(),
      country: country?.trim(),
      state: state?.trim(),
      landmark: landmark?.trim(),
    };

    // Validate input data
    const errors = validateUserData(data);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: `User with ID:${userId} not found.` });
    }

    // Check for phone number conflicts with other users
    const phoneNumberExists = await userModel.findOne({ phoneNumber: data.phoneNumber, _id: { $ne: userId } });
    if (phoneNumberExists) {
      return res.status(400).json({ message: 'Phone number is already in use by another user.' });
    }

    if (req.file) {
      try {
        const cloudProfile = await cloudinary.uploader.upload(req.file.path, { folder: "users_dp" });
        data.profilePicture = {
          pictureId: cloudProfile.public_id,
          pictureUrl: cloudProfile.secure_url,
        };
        await unlink(req.file.path);
      } catch (err) {
        return res.status(500).json({ message: 'Error uploading to Cloudinary: ' + err.message });
      }
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, data, { new: true });
    if (!updatedUser) {
      return res.status(500).json({ message: 'Error updating user information.' });
    }

    const { isAdmin, isVerified, isSuperAdmin, password, __v, ...sanitizedUser } = updatedUser.toObject();

    res.status(200).json({
      message: `User with ID:${userId} was updated successfully.`,
      data: sanitizedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No profile picture selected" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header is missing" });
    }

    const userToken = authHeader.split(" ")[1];
    const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET);
    const userId = decodedUser.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let cloudProfile;
    try {
      cloudProfile = await cloudinary.uploader.upload(req.file.path, { folder: "users_dp" });
    } catch (uploadError) {
      return res.status(500).json({ message: "Error uploading to Cloudinary: " + uploadError.message });
    }

    const pictureUpdate = {
      profilePicture: {
        pictureId: cloudProfile.public_id,
        pictureUrl: cloudProfile.secure_url,
      },
    };

    const updatedUser = await userModel.findByIdAndUpdate(userId, pictureUpdate, { new: true });
    if (!updatedUser) {
      return res.status(500).json({ message: "Error updating user picture." });
    }

    await unlink(req.file.path);

    return res.status(200).json({
      message: "User image successfully changed",
      data: updatedUser.profilePicture,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await userModel.findByIdAndDelete(userId);

    res.status(200).json({ 
      message: `User with ID:${userId} was deleted successfully.` 
    });

  } catch (error) {
    console.error("Error deleting user:", error); 
    res.status(500).json({ 
      message: "An error occurred while deleting the user." 
    });
  }
};



exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate the user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Retrieve the user from the database
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Exclude sensitive fields
    const { password, __v, createdAt, updatedAt, isAdmin, isVerified, isSuperAdmin, ...userDetails } = user.toObject();

    res.status(200).json({ data: userDetails });

  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: 'An error occurred while retrieving the user.' });
  }
};



exports.getAllUsers = async (req, res) => {
  try {
    // Optionally implement pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Fetch users with pagination
    const users = await userModel.find().skip(skip).limit(limit);

    if (users.length === 0) {
      return res.status(404).json({
        message: 'No users found.',
      });
    }

    // Exclude sensitive information
    const usersDetails = users.map(user => {
      const { password,__v, createdAt, updatedAt, isAdmin, isVerified, isSuperAdmin, ...userObj } = user.toObject();
      return userObj;
    });

    // Count total number of users
    const totalUsers = await userModel.countDocuments();

    return res.status(200).json({
      message: 'List of all users:',
      data: usersDetails,
      totalNumberOfUsers: totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    });

  } catch (error) {
    console.error("Error retrieving users:", error); // Log the error for debugging
    return res.status(500).json({
      message: 'An error occurred while retrieving the users.',
    });
  }
};


exports.deleteTenant = async (req, res) => {
  try {
    const { tenantId } = req.params; // Extract tenant ID from request parameters
    const landlordId = req.user.id; // Retrieve landlord ID from authenticated user

    // Find the tenant to ensure they exist and are associated with the landlord
    const tenant = await tenantModel.findById(tenantId).populate('property');

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found.' });
    }

    // Check if the tenant's landlord matches the authenticated user
    if (tenant.landlord.toString() !== landlordId) {
      return res.status(403).json({ message: 'You are not authorized to delete this tenant.' });
    }

    // Delete the tenant from the landlord's list
    await userModel.findByIdAndUpdate(landlordId, { $pull: { tenants: tenantId } });

    // Delete the tenant from the property's tenant list
    await propertyModel.findByIdAndUpdate(tenant.property._id, { $pull: { tenants: tenantId } });

    // Delete the tenant from the tenant model
    await tenantModel.findByIdAndDelete(tenantId);

    res.status(200).json({ message: 'Tenant deleted successfully.' });
  } catch (error) {
    console.error('Error deleting tenant:', error); // Log the error details
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

