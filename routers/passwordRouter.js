const passwordRouter = require("express").Router();
const { authenticator } = require("../middlewares/authentication");
const { passwordValidator, emailValidator } = require("../middlewares/passwordAndEmailValidator");
const {
    changePassword,
    forgotPassword,
    resetPassword
} = require("../controllers/passwordController");

// Change password
passwordRouter.put('/change-password/:token', authenticator, passwordValidator, changePassword);

// Request password reset
passwordRouter.post('/forgotPassword', emailValidator, forgotPassword);

// Reset password
passwordRouter.post('/resetPassword/:token', passwordValidator, resetPassword);

module.exports = passwordRouter;
