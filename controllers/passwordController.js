require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const resetPasswordhtml = require("../helpers/html");


const changePassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Verify the JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Find the user by their ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
    });
    }

    // Check if the old password is correct
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({
        message: 'Invalid old password'
    });
    }

    // Validate that the new password and confirm new password match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: 'New password and confirm new password do not match'
    });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({
        message: 'Password changed successfully'
    });
  } catch (error) {
    return res.status(500).json({
        message: error.message
    });
  }
};




const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Find user by email
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User with this email does not exist' });
      }
  
      const userName = user.firstName; // Adjust according to your user model
  
      // Generate a JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET, // Ensure this matches your environment variable
        { expiresIn: '1d' }
      );
  
      // Construct the password reset link
      const resetLink = `https://goal.com/reset-password/${token}`; // Adjust as needed
  
      // Generate HTML email content
      const emailContent = resetPasswordhtml(userName, resetLink);
      const emailSubject = 'Password Reset Request';
  
      // Set up email options
      const mailOptions = {
        from: process.env.mailUser, // Ensure this matches your environment variable
        to: user.email, // This should be correct if 'email' is the field name in your user model
        subject: emailSubject,
        html: emailContent
      };
  
      // Send the email
      await sendEmail(mailOptions);
  
      res.status(200).json({
        message: 'Password reset email sent successfully',
        token
      });
  
    } catch (error) {
      res.status(500).json({
          message: error.message
      });
    }
  };

  

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    // Find user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
    });
    }

    // Check if new password matches confirmation
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: 'New password and confirmation do not match'
    });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
        message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({
        message: error.message
    });
  }
};





module.exports = {
  changePassword,
  forgotPassword,
  resetPassword
};
