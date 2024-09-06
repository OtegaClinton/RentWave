const jwt = require('jsonwebtoken');
const userModel = require("../models/userModel");
require("dotenv").config();



// for admin
exports.authorization = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(400).json({ message: "No token provided. Authorization denied." });
        }

        const data = jwt.verify(token, process.env.JWT_SECRET);

        req.user = data.firstName; // Ensure your token contains `firstName`

        const checkUser = await userModel.findOne({ firstName: req.user });

        if (!checkUser) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!checkUser.isAdmin && !checkUser.isSuperAdmin) {
            return res.status(401).json({ message: "You are not permitted to perform this action." });
        }

        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired. Please login again." });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token. Authorization denied." });
        }
        res.status(500).json({ message: error.message });
    }
};




// for super Admin
exports.authorizationSuper = async (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(400).json("No token provided. Authorization denied.");
        }

        const data = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.firstName; 

        const checkUser = await userModel.findOne({ firstName: req.user });

        if (!checkUser) {
            return res.status(404).json("User not found.");
        }

        if (!checkUser.isSuperAdmin) {
            return res.status(401).json("You are not permitted to perform this action.");
        }

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json("Token expired. Please login again.");
        }
        res.status(500).json({ message: error.message });
    }
};

