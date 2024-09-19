const jwt = require('jsonwebtoken');

exports.authenticator = async (req, res, next) => {
    try {
        // Extract the token from the Authorization header
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided. Authorization denied." });
        }

        // Verify the token
        const data = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request object
        req.user = data; // You can access req.user in subsequent middleware/controllers
        
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired. Please login again." });
        }
        // Log the error for debugging purposes
        console.error('Authentication Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// const jwt = require('jsonwebtoken');

// exports.authenticator = (roles = []) => {
//   return async (req, res, next) => {
//     try {
//       // Extract the token from the Authorization header
//       const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

//       if (!token) {
//         return res.status(401).json({ message: "No token provided. Authorization denied." });
//       }

//       // Verify the token
//       const data = jwt.verify(token, process.env.JWT_SECRET);

//       // Attach user data to request object
//       req.user = data; // You can access req.user in subsequent middleware/controllers

//       // If roles are specified, check if the user's role is allowed
//       if (roles.length && !roles.includes(req.user.role)) {
//         return res.status(403).json({ message: "Access denied. You do not have the required role." });
//       }

//       next();

//     } catch (error) {
//       if (error.name === 'TokenExpiredError') {
//         return res.status(401).json({ message: "Token expired. Please login again." });
//       }
//       // Log the error for debugging purposes
//       console.error('Authentication Error:', error);
//       res.status(500).json({ message: error.message });
//     }
//   };
// };


