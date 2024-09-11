const express = require('express');
const rentDueRouter = express.Router();
const {notifyDueRent,dueRentReminder,generateAndSendInvoicesForToday} = require('../controllers/notificationController'); 

// Create a route to test notifyDueRent
rentDueRouter.get('/test/notifyDueRent', async (req, res) => {
  try {
    await notifyDueRent();
    res.status(200).json({ message: 'Due rent notifications sent successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notifications.' });
  }
});

// Define a route to trigger the notification reminder
rentDueRouter.get('/test-notification-reminder', async (req, res) => {
    try {
      await dueRentReminder(); // Call the function
      res.status(200).json({ message: 'Notification reminder triggered successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to trigger notification reminder.' });
    }
  });

  // Route to manually trigger invoice generation
rentDueRouter.get('/generate-invoices', async (req, res) => {
  try {
    await generateAndSendInvoicesForToday();
    res.status(200).json({ message: 'Invoices have been generated and sent successfully.' });
  } catch (error) {
    console.error('Error generating invoices:', error.message);
    res.status(500).json({ message: 'Failed to generate invoices.', error: error.message });
  }
});

module.exports = rentDueRouter;
