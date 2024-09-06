const userModel = require("../models/userModel");
const propertyModel = require("../models/propertyModel");
const tenantModel = require('../models/tenantModel'); 
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt =require("jsonwebtoken");
const sendMail=require("../helpers/email");
const {html,reverifyHtml} = require("../helpers/html");
const cloudinary = require("../helpers/cloudinary");




exports.signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, phoneNumber } = req.body;

    // Validate confirmPassword matches password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { phoneNumber }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone number already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new userModel({
      firstName:firstName.trim(),
      lastName:lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      // Exclude confirmPassword from the user model as it is not needed in the database
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
      subject: 'Kindly verify your mail.',
      email: newUser.email,
      html: html(verifyLink, newUser.firstName)
    });

    res.status(201).json({
      message: `Welcome ${newUser.firstName}, kindly check your email to access the link to verify your email.`,
      data: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
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
          email: findUser.email,
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
      email: user.email,
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




exports.logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Normalize email to lower case
    const normalizedEmail = email.toLowerCase();

    // Check if the user exists
    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: 'Invalid email or password.' // More general error message
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email to log in.'
      });
    }

    // Verify the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: 'Invalid email or password.' // More general error message
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, firstName: user.firstName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } 
    );

    // Destructure the user object to exclude sensitive fields
    const {
      password: userPassword,
      isVerified,
      phoneNumber,
      createdAt,
      updatedAt,
      __v,
      isAdmin,
      isSuperAdmin,
      ...otherDetails
    } = user._doc;

    res.status(200).json({
      message: 'Login successful.',
      data: otherDetails,
      token: token
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, phoneNumber } = req.body;
    const data = { firstName, lastName, phoneNumber };

    // Validate input data
    const errors = [];

    if (!firstName || typeof firstName !== 'string' || !/^[A-Za-z]+$/.test(firstName)) {
      errors.push('First name is required and can only contain letters.');
    }

    if (!lastName || typeof lastName !== 'string' || !/^[A-Za-z]+$/.test(lastName)) {
      errors.push('Last name is required and can only contain letters.');
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || !/^[0-9]{11}$/.test(phoneNumber)) {
      errors.push('Phone number is required and must be exactly 11 digits long.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    // Check if the user exists before proceeding
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: `User with ID:${userId} not found.` });
    }

    // Check if the new phone number is already in use by another user
    const phoneNumberExists = await userModel.findOne({ phoneNumber });
    if (phoneNumberExists) {
      return res.status(400).json({ message: 'Phone number is already in use by another user.' });
    }

    // Handle file upload if a file is present in the request
    if (req.file) {
      try {
        const cloudProfile = await cloudinary.uploader.upload(req.file.path, { folder: "users_dp" });
        data.profilePicture = {
          pictureId: cloudProfile.public_id,
          pictureUrl: cloudProfile.secure_url
        };
      } catch (err) {
        return res.status(500).json({ message: 'Error uploading to Cloudinary: ' + err.message });
      }
    }

    // Update user information
    const updatedUser = await userModel.findByIdAndUpdate(userId, data, { new: true });

    // Remove sensitive fields
    const { isAdmin, isVerified, isSuperAdmin, password, __v, ...sanitizedUser } = updatedUser.toObject();

    res.status(200).json({
      message: `User with ID:${userId} was updated successfully.`,
      data: sanitizedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





exports.uploadProfilePicture = async (req, res) => {
  try {
    // Check if a file is provided
    if (!req.file) {
      return res.status(400).json({ message: "No profile picture selected" });
    }

    // Extract token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header is missing" });
    }

    const userToken = authHeader.split(" ")[1];

    // Verify token
    const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET);
    const userId = decodedUser.id;

    // Find user to get the current profile picture
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload new profile picture to Cloudinary
    let cloudProfile;
    try {
      cloudProfile = await cloudinary.uploader.upload(req.file.path, { folder: "users_dp" });
    } catch (uploadError) {
      return res.status(500).json({ message: "Error uploading to Cloudinary: " + uploadError.message });
    }

    // Prepare update data
    const pictureUpdate = {
      profilePicture: {
        pictureId: cloudProfile.public_id,
        pictureUrl: cloudProfile.secure_url
      }
    };

    // Update user profile picture
    const updatedUser = await userModel.findByIdAndUpdate(
      userId, 
      pictureUpdate, 
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({ message: "Error updating user picture." });
    }

    // Return success response
    return res.status(200).json({
      message: "User image successfully changed",
      data: updatedUser.profilePicture
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
