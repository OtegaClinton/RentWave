const paymentModel = require('../models/paymentModel');
const tenantModel = require('../models/tenantModel');
const sendMail = require("../helpers/email");

const notifyDueRent = async () => {
  try {
    const duePayments = await paymentModel.find({
      status: 'Unpaid',
      dueDate: {
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Within the next 7 days
      }
    }).populate('tenant landlord');

    for (const payment of duePayments) {
      const { tenant, landlord, amount, dueDate } = payment;

      if (!tenant) continue; // Ensure the tenant exists

      const mailOptions = {
        email: tenant.email,
        subject: 'Rent Due Reminder',
        message: `Dear ${tenant.firstName}, this is a reminder that your rent of ${amount} is due on ${dueDate.toDateString()}. Please ensure payment is made to avoid any late fees.`,
        html: `<p>Dear ${tenant.firstName},</p><p>This is a reminder that your rent of <strong>${amount}</strong> is due on <strong>${dueDate.toDateString()}</strong>. Please ensure payment is made to avoid any late fees.</p><p>Thank you,<br/>RentWave</p>`
      };

      await sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Error tracking due rent:', error);
  }
};





const dueRentReminder = async () => {
    try {
      // Find tenants whose lease ends within the next 7 days
      const upcomingLeaseEndTenants = await tenantModel.find({
        leaseEnd: {
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Lease ending within the next 7 days
        }
      }).populate('landlord');
  
      for (const tenant of upcomingLeaseEndTenants) {
        const { firstName, email, leaseEnd, landlord } = tenant;
  
        // Construct the email options for lease end reminder
        const mailOptions = {
          email: email, 
          subject: 'Reminder: Lease Expiry Approaching',
          message: `Dear ${firstName}, this is a reminder that your lease is approaching its end on ${leaseEnd.toDateString()}. Please make necessary arrangements or contact your landlord, ${landlord.firstName} ${landlord.lastName}, to discuss renewal or further steps.`,
          html: `<p>Dear ${firstName},</p><p>This is a reminder that your lease is approaching its end on <strong>${leaseEnd.toDateString()}</strong>. Please make necessary arrangements or contact your landlord, ${landlord.firstName} ${landlord.lastName}, to discuss renewal or further steps.</p><p>Thank you,<br/>RentWave</p>`
        };
  
        // Send the email notification
        await sendMail(mailOptions);
      }
    } catch (error) {
      console.error('Error sending lease end reminder:', error);
    }
  };
  



module.exports = {notifyDueRent,dueRentReminder};
