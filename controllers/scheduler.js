const cron = require('node-cron');
const {notifyDueRent,dueRentReminder,generateAndSendInvoicesForToday} = require('../controllers/notificationController'); 

// Schedule the function to run at 7 AM every day Nigerian time
cron.schedule('0 7 * * *', notifyDueRent, {
  scheduled: true,
  timezone: "Africa/Lagos" // Set timezone for Nigeria
});

console.log('Scheduler is running...');




// Schedule the function to run at 8 AM every day
cron.schedule('0 8 * * *', dueRentReminder, {
  scheduled: true,
  timezone: "Africa/Lagos" // Nigeria timezone
});


console.log('Scheduler is running...');


// Schedule the function to run daily at 9 AM
cron.schedule('0 9 * * *', generateAndSendInvoicesForToday, {
  scheduled: true,
  timezone: "Africa/Lagos" // Nigeria timezone
});


console.log('Scheduler is running...');

