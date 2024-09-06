const adminRouter = require("express").Router();
const {authenticator} = require("../middlewares/authentication");
const {authorization,authorizationSuper} = require("../middlewares/authorization");
const {makeAdmin,makeSuperAdmin} = require("../controllers/adminController");



// Make a user an admin
adminRouter.put('/makeAdmin/:id', authenticator, authorizationSuper, makeAdmin);

// Make a user a super admin
adminRouter.put('/makeSuperAdmin/:id', authenticator, authorizationSuper, makeSuperAdmin);



module.exports = adminRouter;