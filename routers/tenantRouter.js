const tenantRouter = require("express").Router();
const {authenticator} = require("../middlewares/authentication");
const {authorization,authorizationSuper} = require("../middlewares/authorization");
const {
    onboardTenant,
    tenantLogin,
    updateTenantProfile,
    addProfilePictureTenant,
    updateProfilePicture,
    createMaintenanceRequest,
  
}= require("../controllers/tenantController");
const uploader = require("../helpers/multer");




tenantRouter.post('/onboardtenant', authenticator, onboardTenant);
tenantRouter.post('/logintenant', tenantLogin);

tenantRouter.put('/updateprofile', authenticator, uploader.single('profilePicture'), updateTenantProfile);

// Route to add/update tenant profile picture
tenantRouter.post('/tenants/addpicture', authenticator, uploader.single('profilePicture'),addProfilePictureTenant);

tenantRouter.post('/tenants/updatepicture', authenticator, uploader.single('profilePicture'),updateProfilePicture);


tenantRouter.post(
    '/request', 
    authenticator, 
    uploader.array('pictures', 3), 
  createMaintenanceRequest
  );







module.exports= tenantRouter;