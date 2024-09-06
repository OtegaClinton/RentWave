const userRouter = require("express").Router();
const {authenticator} = require("../middlewares/authentication");
const {authorization,authorizationSuper} = require("../middlewares/authorization");
const {
    signUp,
    verifyEmail,
    newEmail,
    logIn,
    updateUser,
    uploadProfilePicture,
    deleteUser,
    getUserById,
    getAllUsers
} = require("../controllers/userController");

const {userValidator}= require("../middlewares/userValidator");
const uploader = require("../helpers/multer");



// User signup
userRouter.post('/signup',userValidator, signUp);

// Verify email
userRouter.get('/verify/:id/:token', verifyEmail);

// Resend verification email
userRouter.post('/newemail', newEmail);

// User login
userRouter.post('/login', logIn);

// Update user details
userRouter.put('/update/:id',authenticator, uploader.single('profilePicture'), updateUser);

// Update profile picture
userRouter.post('/updatepicture', authenticator, uploader.single('profilePicture'), uploadProfilePicture);

// Delete user
userRouter.delete('/delete/:id', authenticator,authorization, authorizationSuper, deleteUser);

// Get a single user by ID
userRouter.get('/user/:id', authenticator, getUserById);

// Get all users
userRouter.get('/users',authenticator,authorization,authorizationSuper, getAllUsers);


module.exports= userRouter;




// const express = require('express');
// const userRouter = express.Router();
// const { authenticator } = require('../middlewares/authentication');
// const {userValidator}= require("../middlewares/userValidator");
// const { authorization, authorizationSuper } = require('../middlewares/authorization');
// const {
//     signUp,
//     verifyEmail,
//     newEmail,
//     logIn,
//     updateUser,
//     uploadProfilePicture,
//     deleteUser,
//     getUserById,
//     getAllUsers
// } = require('../controllers/userController');



// // User signup
// userRouter.post('/signup', userValidator, signUp);

// // Verify email
// userRouter.get('/verify/:id/:token', verifyEmail);

// // Resend verification email
// userRouter.post('/newemail', newEmail);

// // User login
// userRouter.post('/login', logIn);

// // Update user details (file upload handled by express-fileupload)
// userRouter.put('/update/:id', authenticator, updateUser);

// // Update profile picture (file upload handled by express-fileupload)
// userRouter.post('/updatepicture', authenticator, uploadProfilePicture);

// // Delete user
// userRouter.delete('/delete/:id', authenticator, authorization, authorizationSuper, deleteUser);

// // Get a single user by ID
// userRouter.get('/user/:id', authenticator, getUserById);

// // Get all users
// userRouter.get('/users', authenticator, authorization, authorizationSuper, getAllUsers);

// module.exports = userRouter;

