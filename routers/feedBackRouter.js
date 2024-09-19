

const express = require('express');
const { sendFeedback } = require('../controllers/feedBackController'); 
const feedBackRouter = express.Router();
const { authenticator } = require('../middlewares/authentication'); 


// Route to handle feedback
feedBackRouter.post('/feedback', authenticator, sendFeedback); 


module.exports = feedBackRouter;
