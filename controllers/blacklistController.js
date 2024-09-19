const BlacklistedTokenModel = require('../models/blacklistModel'); 

exports.logOut = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header

    // Store the token in the database
    await BlacklistedTokenModel.create({ token, createdAt: new Date() });

    res.status(200).json({
      message: 'Logout successful. Token is now invalidated.',
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      message: 'An error occurred during logout. Please try again later.',
      error: error.message,
    });
  }
};
