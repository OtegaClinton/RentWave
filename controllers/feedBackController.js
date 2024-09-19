const tenantModel = require('../models/tenantModel');
const userModel = require('../models/userModel');
const sendMail = require("../helpers/email");

// Function to allow tenants or users to send email or feedback
exports.sendFeedback = async (req, res) => {
    const { email, message } = req.body; // Email and message are still required
    const userId = req.user.id; // Assuming req.user contains authenticated user's ID
    let userType;
  
    try {
      // Validate input fields
      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        return res.status(400).json({ message: 'Valid email is required.' });
      }
  
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ message: 'Message content is required.' });
      }
  
      let user;
  
      // Check if the user is a tenant
      user = await tenantModel.findById(userId);
      if (user) {
        userType = 'tenant'; // Set userType to 'tenant'
      } else {
        // If not a tenant, check if the user is a landlord (or general user)
        user = await userModel.findById(userId);
        if (user) {
          userType = 'user'; // Set userType to 'user' or 'landlord'
        }
      }
  
      // If no user is found
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Set up email content dynamically
      const mailOptions = {
        to: 'rentwave50@gmail.com', // Replace with the company email that will receive feedback
        subject: 'New Feedback/Complaint',
        html: `<p>Feedback from ${userType} (${email}):</p><p>${message}</p>`, // HTML formatted message
      };
  
      // Send the email using your existing sendMail function
      await sendMail(mailOptions);
  
      // Respond with success
      res.status(200).json({ message: 'Feedback sent successfully.' });
  
    } catch (error) {
      console.error('Error sending feedback email:', error);
      res.status(500).json({ message: 'Error sending feedback email.' });
    }
  };
  