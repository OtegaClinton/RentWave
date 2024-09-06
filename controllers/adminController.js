const userModel = require("../models/userModel");


exports.makeAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await userModel.findByIdAndUpdate(userId, { isAdmin: true }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({
        message: `User with ID ${userId} not found.`
      });
    }

    res.status(200).json({
      message: `${updatedUser.firstName} is now an ADMIN.`,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};




exports.makeSuperAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await userModel.findByIdAndUpdate(userId, { isSuperAdmin: true, isAdmin: true }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({
        message: `User with ID ${userId} not found.`
      });
    }

    res.status(200).json({
      message: `${updatedUser.firstName} is now a SUPER ADMIN.`,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

