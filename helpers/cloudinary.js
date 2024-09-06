const cloudinary = require('cloudinary');
require("dotenv").config();

const api_key = process.env.CLOUDINARY_API_KEY

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: api_key,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;


// const cloudinary = require('cloudinary').v2;
// require('dotenv').config();

// // Configure Cloudinary with your environment variables
// cloudinary.v2.config({
//   cloud_name: process.env.cloud_name,
//   api_key: process.env.api_key,
//   api_secret: process.env.api_secret,
//   secure: true,  
// });

// module.exports = cloudinary;
