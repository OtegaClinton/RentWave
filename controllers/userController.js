const userModel = require("../models/userModel");
const propertyModel = require("../models/propertyModel");
const tenantModel = require('../models/tenantModel'); 
const maintenanceModel = require('../models/maintenanceModel'); 
const paymentModel = require("../models/paymentModel");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt =require("jsonwebtoken");
const sendMail=require("../helpers/email");
const {html,reverifyHtml} = require("../helpers/html");
const cloudinary = require("../helpers/cloudinary");
const fileSystem = require("fs");
const { unlink } = require('fs/promises');
const path = require('path');



// exports.signUp = async (req, res) => {
//   try {
//     let {
//       firstName = '',
//       lastName = '',
//       email = '',
//       password = '',
//       confirmPassword = '',
//       phoneNumber = ''
//     } = req.body;

//     // Check for missing or empty fields
//     if (!firstName.trim()) {
//       return res.status(400).json({ message: 'First name is required.' });
//     }
//     if (!lastName.trim()) {
//       return res.status(400).json({ message: 'Last name is required.' });
//     }
//     if (!email.trim()) {
//       return res.status(400).json({ message: 'Email is required.' });
//     }
//     if (!password) {
//       return res.status(400).json({ message: 'Password is required.' });
//     }
//     if (!confirmPassword) {
//       return res.status(400).json({ message: 'Confirm password is required.' });
//     }
//     if (!phoneNumber.trim()) {
//       return res.status(400).json({ message: 'Phone number is required.' });
//     }

//     // Trim and sanitize input
//     firstName = firstName.trim();
//     lastName = lastName.trim();
//     email = email.trim().toLowerCase();
//     phoneNumber = phoneNumber.trim();

//     console.log('Trimmed Values:', { firstName, lastName, email, phoneNumber });

//     // Define regex patterns
//     const consecutiveSymbolsPattern = /([!@#$%^&*()_+={}\[\]:;"'<>,.?/\\-])\1{2,}/;
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const phoneNumberPattern = /^\d{11}$/;
//     const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\-]).{6,}$/;

//     // Check for consecutive symbols in all inputs
//     if (consecutiveSymbolsPattern.test(firstName)) {
//       return res.status(400).json({ message: 'First name contains consecutive symbols. Please avoid repeating special characters.' });
//     }
//     if (consecutiveSymbolsPattern.test(lastName)) {
//       return res.status(400).json({ message: 'Last name contains consecutive symbols. Please avoid repeating special characters.' });
//     }
//     if (consecutiveSymbolsPattern.test(email)) {
//       return res.status(400).json({ message: 'Email contains consecutive symbols. Please avoid repeating special characters.' });
//     }
//     if (consecutiveSymbolsPattern.test(password)) {
//       return res.status(400).json({ message: 'Password contains consecutive symbols. Please avoid repeating special characters.' });
//     }
//     if (consecutiveSymbolsPattern.test(confirmPassword)) {
//       return res.status(400).json({ message: 'Confirm password contains consecutive symbols. Please avoid repeating special characters.' });
//     }
//     if (consecutiveSymbolsPattern.test(phoneNumber)) {
//       return res.status(400).json({ message: 'Phone number contains consecutive symbols. Please enter only digits.' });
//     }

//     // Validate input lengths and patterns
//     if (firstName.length < 3) {
//       return res.status(400).json({ message: 'First name must be at least 3 characters long.' });
//     }
//     if (lastName.length < 3) {
//       return res.status(400).json({ message: 'Last name must be at least 3 characters long.' });
//     }
//     if (!emailPattern.test(email)) {
//       return res.status(400).json({ message: 'Invalid email format. Please provide a valid email address.' });
//     }
//     if (!passwordPattern.test(password)) {
//       return res.status(400).json({ message: 'Password must be at least 6 characters long, contain at least one uppercase letter, and one special character.' });
//     }
//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: 'Passwords do not match. Please ensure both password fields match.' });
//     }
//     if (!phoneNumberPattern.test(phoneNumber)) {
//       return res.status(400).json({ message: 'Phone number must be exactly 11 digits long.' });
//     }

//     // Check if the user already exists
//     const existingUser = await userModel.findOne({
//       $or: [{ email }, { phoneNumber }]
//     });

//     if (existingUser) {
//       if (existingUser.email === email) {
//         return res.status(400).json({ message: 'The email address is already in use. Please use a different email address.' });
//       }
//       if (existingUser.phoneNumber === phoneNumber) {
//         return res.status(400).json({ message: 'The phone number is already in use. Please use a different phone number.' });
//       }
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create a new user
//     const newUser = new userModel({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       phoneNumber
//     });

//     // Save the user to the database
//     await newUser.save();

//     // Generate a JWT token
//     const userToken = jwt.sign(
//       { id: newUser._id, email: newUser.email, firstName: newUser.firstName },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     // Construct the verification link
//     const verifyLink = `${req.protocol}://${req.get('host')}/api/v1/verify/${newUser._id}/${userToken}`;

//     // Send verification email
//     await sendMail({
//       subject: 'Kindly verify your email.',
//       to: newUser.email,
//       html: html(verifyLink, newUser.firstName)
//     });

//     // res.status(201).json({
//     //   message: `Welcome ${newUser.firstName}, kindly check your email to verify your account.`,
//     //   data: {
//     //     id: newUser._id,
//     //     firstName: newUser.firstName,
//     //     lastName: newUser.lastName,
//     //     email: newUser.email,
//     //   }
//     // });

//     // Serve the "Check your email" page with a countdown to redirect to homepage
//     const redirectUrl = 'https://rent-wave.vercel.app/#/';
//     const htmlTemplate = `
//     <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta http-equiv="X-UA-Compatible" content="IE=edge">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Email Verification - RentWave</title>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #f0f4f8;
//             color: #333;
//             margin: 0;
//             padding: 0;
//         }
//         .container {
//             width: 50%; /* Reduced width */
//             max-width: 600px; /* Set max width for responsiveness */
//             margin: 40px auto; /* Centered horizontally */
//             padding: 20px;
//             text-align: center;
//             border: 1px solid #d0dbe1;
//             border-radius: 10px;
//             background-color: #f4f4f4;
//             box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
//         }
//         .header {
//             display: flex;
//             align-items: center;
//             justify-content: space-between;
//             background-color: #5F92DF;
//             padding: 20px;
//             color: white;
//             border-radius: 10px 10px 0 0;
//         }
//         .header img {
//             width: 120px;
//             height: auto; /* Maintain aspect ratio */
//         }
//         .header h1 {
//             margin: 0;
//             flex-grow: 1;
//             text-align: center;
//             margin-right: 120px; /* To offset the logo width */
//         }
//         .content {
//             padding: 20px;
//             color: #333;
//         }
//         .footer {
//             margin-top: 20px;
//             padding: 10px;
//             background-color: #5F92DF;
//             color: white;
//             border-radius: 0 0 10px 10px;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <div class="header">
//             <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
//             <h1>Email Verification</h1>
//         </div>
//         <div class="content">
//             <p>Thank you for signing up.</p>
//             <p>To complete your registration, please verify your email address. We have sent a verification email to your inbox.</p>
//             <p>You will be redirected to the login page in <span id="countdown">10</span> seconds.</p>
//         </div>
//         <div class="footer">
//             <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
//         </div>
//     </div>

//     <script>
//         let countdown = 10;
//         const countdownElement = document.getElementById('countdown');
//         const redirectUrl = "${redirectUrl}";

//         setInterval(() => {
//             if (countdown > 0) {
//                 countdown--;
//                 countdownElement.textContent = countdown;
//             } else {
//                 window.location.href = redirectUrl;
//             }
//         }, 1000);
//     </script>
// </body>
// </html>
//        `;

//     // Send the HTML response to the user
//     res.status(201).set('Content-Type', 'text/html').send(htmlTemplate);



//   } catch (error) {
//     console.error('Error during sign-up:', error);
    
//     // Handle duplicate key error
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyValue)[0];
//       const value = Object.values(error.keyValue)[0];
//       return res.status(400).json({
//         message: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists. Please use a different ${field}.`
//       });
//     }

//     res.status(500).json({
//       message: 'An unexpected error occurred. Please try again later.',
//       error: error.message 
//     });
//   }
// };



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

    // Check for missing or empty fields
    if (!firstName.trim()) {
      return res.status(400).json({ message: 'First name is required.' });
    }
    if (!lastName.trim()) {
      return res.status(400).json({ message: 'Last name is required.' });
    }
    if (!email.trim()) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }
    if (!confirmPassword) {
      return res.status(400).json({ message: 'Confirm password is required.' });
    }
    if (!phoneNumber.trim()) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    // Trim and sanitize input
    firstName = firstName.trim();
    lastName = lastName.trim();
    email = email.trim().toLowerCase();
    phoneNumber = phoneNumber.trim();

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
      return res.status(400).json({ message: 'Phone number contains consecutive symbols. Please enter only digits.' });
    }

    // Validate input lengths and patterns
    if (firstName.length < 3) {
      return res.status(400).json({ message: 'First name must be at least 3 characters long.' });
    }
    if (lastName.length < 3) {
      return res.status(400).json({ message: 'Last name must be at least 3 characters long.' });
    }
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'Invalid email format. Please provide a valid email address.' });
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
        return res.status(400).json({ message: 'The email address is already in use. Please use a different email address.' });
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return res.status(400).json({ message: 'The phone number is already in use. Please use a different phone number.' });
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

    // Serve the "Check your email" page with a countdown to redirect to homepage
    const redirectUrl = 'https://rent-wave.vercel.app/#/';
    const htmlTemplate = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - RentWave</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f4f8;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 50%; /* Reduced width */
            max-width: 600px; /* Set max width for responsiveness */
            margin: 40px auto; /* Centered horizontally */
            padding: 20px;
            text-align: center;
            border: 1px solid #d0dbe1;
            border-radius: 10px;
            background-color: #f4f4f4;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #5F92DF;
            padding: 20px;
            color: white;
            border-radius: 10px 10px 0 0;
        }
        .header img {
            width: 120px;
            height: auto; /* Maintain aspect ratio */
        }
        .header h1 {
            margin: 0;
            flex-grow: 1;
            text-align: center;
            margin-right: 120px; /* To offset the logo width */
        }
        .content {
            padding: 20px;
            color: #333;
        }
        .footer {
            margin-top: 20px;
            padding: 10px;
            background-color: #5F92DF;
            color: white;
            border-radius: 0 0 10px 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <p>Thank you for signing up.</p>
            <p>To complete your registration, please verify your email address. We have sent a verification email to your inbox.</p>
            <p>You will be redirected to the login page in <span id="countdown">10</span> seconds.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
        </div>
    </div>

    <script>
        let countdown = 10;
        const countdownElement = document.getElementById('countdown');
        const redirectUrl = "${redirectUrl}";

        setInterval(() => {
            if (countdown > 0) {
                countdown--;
                countdownElement.textContent = countdown;
            } else {
                window.location.href = redirectUrl;
            }
        }, 1000);
    </script>
</body>
</html>
       `;

    // Send the HTML response to the user
    res.status(201).set('Content-Type', 'text/html').send(htmlTemplate);

  } catch (error) {
    console.error('Error during sign-up:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Email or phone number already in use.'
      });
    }

    res.status(500).json({ message: 'An error occurred during sign-up.' });
  }
};





// exports.verifyEmail = async (req, res) => {
//   try {
//     const { id, token } = req.params;
//     const findUser = await userModel.findById(id);

//     if (!findUser) {
//       return res.status(404).json({
//         message: 'User not found'
//       });
//     }

//     // Verify the token
//     jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
//       if (error) {
//         const verifyLink = `${req.protocol}://${req.get('host')}/api/v1/newemail/${findUser._id}`;
//         await sendMail({
//           subject: 'Kindly Verify your mail',
//           to: findUser.email,
//           html: html(verifyLink, findUser.firstName)
//         });
//         return res.status(400).json({
//           message: 'This link has expired, kindly check your email for a new link'
//         });
//       }

//       // Check if user is already verified
//       if (findUser.isVerified) {
//         return res.status(400).json({
//           message: 'Your account has already been verified'
//         });
//       }

//       // Update the user's verification status
//       findUser.isVerified = true;
//       await findUser.save();

//       return res.status(200).json({
//         message: 'Email verified successfully'
//       });
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message
//     });
//   }
// };


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
      const message = findUser.isVerified
        ? 'Your account has already been verified.'
        : 'Congratulations, your email has been successfully verified!';

      // Update the user's verification status if not verified
      if (!findUser.isVerified) {
        findUser.isVerified = true;
        await findUser.save();
      }

      // Return the verification status HTML with a countdown and redirect
      const redirectUrl = 'https://rent-wave.vercel.app/#/Login';
      const htmlTemplate = `
     <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - RentWave</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f4f8;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 800px; /* Maximum width for larger screens */
            width: 90%; /* Flexible width for responsiveness */
            margin: 40px auto;
            padding: 20px;
            text-align: center;
            border: 1px solid #d0dbe1;
            border-radius: 10px;
            background-color: #f4f4f4;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #5F92DF;
            padding: 20px;
            color: white;
            border-radius: 10px 10px 0 0;
        }
        .header img {
            width: 120px;
            height: auto; /* Maintain aspect ratio */
        }
        .header h1 {
            margin: 0;
            flex-grow: 1;
            text-align: center;
            margin-right: 120px; /* To offset the logo width */
        }
        .content {
            padding: 20px;
            color: #333;
        }
        .footer {
            margin-top: 20px;
            padding: 10px;
            background-color: #5F92DF;
            color: white;
            border-radius: 0 0 10px 10px;
        }

        /* Media query for mobile responsiveness */
        @media (max-width: 600px) {
            .container {
                width: 95%; /* Reduce width for smaller screens */
                margin: 20px auto;
                padding: 15px;
            }
            .header h1 {
                font-size: 1.5rem; /* Adjust font size for mobile */
                margin-right: 10px; /* Reduce offset for mobile */
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <p>${message}</p>
            <p>You will be redirected to the login page in <span id="countdown">10</span> seconds.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
        </div>
    </div>

    <script>
        let countdown = 10;
        const countdownElement = document.getElementById('countdown');
        const redirectUrl = "${redirectUrl}";

        setInterval(() => {
            if (countdown > 0) {
                countdown--;
                countdownElement.textContent = countdown;
            } else {
                window.location.href = redirectUrl;
            }
        }, 1000);
    </script>
</body>
</html>
      `;

      res.status(200).send(htmlTemplate);
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

    // Check if the request body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Please provide your email and password.' });
    }

    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    // Normalize email to lower case
    const normalizedEmail = email.trim().toLowerCase();

    // Search for the user in tenant and landlord models
    let user = await tenantModel.findOne({ email: normalizedEmail });

    if (!user) {
      user = await userModel.findOne({ email: normalizedEmail }); // Searching in landlord/admin model if not found in tenant model
    }

    // If user not found in both models
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email to log in.' });
    }

    // Verify the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Determine user role (tenant, landlord, admin)
    let role = user.role;
    let isAdmin = user.isAdmin || false;
    let isSuperAdmin = user.isSuperAdmin || false;

    // Generate JWT token including user details
    const token = jwt.sign(
      { id: user._id, role: role, isAdmin: isAdmin, isSuperAdmin: isSuperAdmin },
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

    // Define route paths based on user role
    let redirectUrl;
    if (role === 'tenant') {
      redirectUrl = '/tenant/dashboard';
    } else if (role === 'landlord') {
      redirectUrl = '/landlord/dashboard';
    } else if (isAdmin || isSuperAdmin) {
      redirectUrl = '/admin/dashboard';
    }

    res.status(200).json({
      message: 'Login successful.',
      data: otherDetails,
      token: token,
      redirectUrl: redirectUrl,
    });
  } catch (error) {
    console.error('Error during login:', error); // Log the error for debugging
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
      message: "User image successfully uploaded.",
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




exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // Validate status input
    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Status must be "Pending", "In Progress", or "Completed".'
      });
    }

    // Retrieve landlordId from the authenticated user
    const landlordId = req.user.id;

    // Find the maintenance request by ID
    const maintenanceRequest = await maintenanceModel.findById(requestId);
    if (!maintenanceRequest) {
      return res.status(404).json({ message: "Maintenance request not found." });
    }

    // Verify that the user updating the status is the landlord of the property related to this maintenance request
    const property = await propertyModel.findById(maintenanceRequest.propertyId);
    if (!property || property.listedBy.toString() !== landlordId.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this maintenance request." });
    }

    // Ensure that once the status is "In Progress," it cannot be changed back to "Pending"
    if (maintenanceRequest.status === 'In Progress' && status === 'Pending') {
      return res.status(400).json({
        message: 'Cannot change status from "In Progress" back to "Pending".'
      });
    }

    // Ensure that once the status is "Completed," it cannot be changed back to "In Progress" or "Pending"
    if (maintenanceRequest.status === 'Completed' && ['Pending', 'In Progress'].includes(status)) {
      return res.status(400).json({
        message: 'Cannot change status from "Completed" back to "Pending" or "In Progress".'
      });
    }

    // Update the status and set the completion date if the status is "Completed"
    maintenanceRequest.status = status;
    if (status === 'Completed') {
      maintenanceRequest.completionDate = new Date();
    }

    await maintenanceRequest.save();

    res.status(200).json({
      message: 'Maintenance request status updated successfully.',
      maintenanceRequest
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating maintenance request status.',
      error: error.message
    });
  }
};




exports.getMaintenanceRequestsForTenant = async (req, res) => {
    try {
        const landlordId = req.user.id; // Get landlord ID from the token
        const { tenantId } = req.params; // Get tenant ID from request parameters

        // Find the tenant and check if it is managed by the landlord
        const tenant = await tenantModel.findOne({ _id: tenantId, landlord: landlordId });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found or does not belong to this landlord' });
        }

        // Find all maintenance requests associated with this tenant
        const maintenanceRequests = await maintenanceModel.find({ tenant: tenantId });

        // Respond with the maintenance requests
        res.status(200).json({
            totalNumberOfRequests:maintenanceRequests.length,
            data: maintenanceRequests
        });
    } catch (error) {
        console.error('Error fetching maintenance requests for the tenant:', error.message);
        res.status(500).json({ message: 'Error fetching maintenance requests for the tenant' });
    }
};








exports.getAllMaintenanceRequestsForLandlord = async (req, res) => {
    try {
        const landlordId = req.user.id; // Get landlord ID from the token

        // Find all tenants managed by the landlord
        const tenants = await tenantModel.find({ landlord: landlordId }).select('_id');
        if (tenants.length === 0) {
            return res.status(404).json({ message: 'No tenants found for this landlord' });
        }

        // Extract tenant IDs
        const tenantIds = tenants.map(tenant => tenant._id);

        // Find all maintenance requests associated with these tenants
        const maintenanceRequests = await maintenanceModel.find({ tenant: { $in: tenantIds } });

        // Respond with the maintenance requests
        res.status(200).json({
            totalNumberOfRequests:maintenanceRequests.length,
            data: maintenanceRequests
        });
    } catch (error) {
        console.error('Error fetching maintenance requests for landlord\'s tenants:', error.message);
        res.status(500).json({ message: 'Error fetching maintenance requests for landlord\'s tenants' });
    }
};




exports.getTenantById = async (req, res) => {
  try {
    const {tenantId} = req.params;

    // Log the received tenant ID
    console.log('Received tenant ID:', tenantId);

    // Validate the tenant ID
    if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({ message: 'Invalid tenant ID format' });
    }

    // Retrieve the tenant from the database
    const tenant = await tenantModel.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Exclude sensitive fields
    const { isVerified, password, __v, createdAt, updatedAt, ...tenantDetails } = tenant.toObject();

    res.status(200).json({ data: tenantDetails });

  } catch (error) {
    console.error("Error retrieving tenant:", error);
    res.status(500).json({ message: 'An error occurred while retrieving the tenant.' });
  }
};




exports.getAllTenants = async (req, res) => {
  try {
    // Optionally implement pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Fetch tenants with pagination
    const tenants = await tenantModel.find().skip(skip).limit(limit);

    if (tenants.length === 0) {
      return res.status(404).json({
        message: 'No tenants found.',
      });
    }

    // Exclude sensitive information
    const tenantsDetails = tenants.map(tenant => {
      const { password, __v, createdAt, updatedAt, ...tenantObj } = tenant.toObject();
      return tenantObj;
    });

    // Count total number of tenants
    const totalTenants = await tenantModel.countDocuments();

    return res.status(200).json({
      message: 'List of all tenants:',
      data: tenantsDetails,
      totalNumberOfTenants: totalTenants,
      currentPage: page,
      totalPages: Math.ceil(totalTenants / limit),
    });

  } catch (error) {
    console.error("Error retrieving tenants:", error); // Log the error for debugging
    return res.status(500).json({
      message: 'An error occurred while retrieving the tenants.',
    });
  }
};




 exports.getAllTenantPayments = async (req, res) => {
  try {
    const landlordId = req.user.id; // Get the landlord ID from the token

    // Step 1: Find properties owned by the landlord
    const properties = await propertyModel.find({ listedBy: landlordId });

    if (!properties || properties.length === 0) {
      return res.status(404).json({ message: 'No properties found for this landlord' });
    }

    // Step 2: Extract property IDs
    const propertyIds = properties.map((property) => property._id);

    // Step 3: Find tenants renting those properties
    const tenants = await tenantModel.find({ property: { $in: propertyIds } });

    if (!tenants || tenants.length === 0) {
      return res.status(404).json({ message: 'No tenants found for this landlord\'s properties' });
    }

    // Step 4: Extract tenant IDs
    const tenantIds = tenants.map((tenant) => tenant._id);

    // Step 5: Find payments made by those tenants
    const payments = await paymentModel.find({ tenant: { $in: tenantIds } });

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: 'No payments found for tenants of this landlord' });
    }

    // Send the payments as a response
    res.status(200).json({ payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




// Function to get all tenants for the authenticated landlord
exports.getTenantsForLandlord = async (req, res) => {
    try {
        // Retrieve the landlord ID from req.user
        const landlordId = req.user.id;

        // Find all tenants associated with the landlord
        const tenants = await tenantModel.find({ listedBy: landlordId });

        // Check if tenants are found
        if (!tenants.length) {
            return res.status(404).json({ message: 'No tenants found for this landlord.' });
        }

        // Respond with the list of tenants
        res.status(200).json(tenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};






