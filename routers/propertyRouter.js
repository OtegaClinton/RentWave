const express = require('express');
const propertyRouter = express.Router();
const cloudinary = require("cloudinary");
const { authenticator } = require('../middlewares/authentication');
const { authorization, authorizationSuper } = require('../middlewares/authorization');
const { propertyValidator } = require('../middlewares/propertyValidator');
const uploader = require('../helpers/multer');
const {
  createProperty,
  getPropertyById,
  getAllProperties,
  updateProperty,
  deleteProperty,
  getAllPropertiesByLandlord
} = require('../controllers/propertyController');

// Create a new property
propertyRouter.post(
  '/properties',
  authenticator,
  uploader.array('images'),
  createProperty
);

// Get a single property by ID
propertyRouter.get('/properties/:id',authenticator, getPropertyById);

// Get all properties
propertyRouter.get('/getallproperties',authenticator, getAllProperties);

// Update a property
propertyRouter.put(
  '/properties/:id',
  authenticator,
  authorization,
  uploader.array('images'),
  updateProperty
);

// Delete a property
propertyRouter.delete('/properties/:id', authenticator, authorization, deleteProperty);

// Route to get all properties owned by a particular landlord
propertyRouter.get('/landlord/properties', authenticator, getAllPropertiesByLandlord);



module.exports = propertyRouter;
