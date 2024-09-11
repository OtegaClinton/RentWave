const paymentModel = require('../models/paymentModel');
const tenantModel = require('../models/tenantModel');
const sendMail = require("../helpers/email");
const mongoose = require('mongoose');

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





// const dueRentReminder = async () => {
//     try {
//       // Find tenants whose lease ends within the next 7 days
//       const upcomingLeaseEndTenants = await tenantModel.find({
//         leaseEnd: {
//           $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Lease ending within the next 7 days
//         }
//       }).populate('landlord');
  
//       for (const tenant of upcomingLeaseEndTenants) {
//         const { firstName, email, leaseEnd, landlord } = tenant;
  
//         // Construct the email options for lease end reminder
//         const mailOptions = {
//           email: email, 
//           subject: 'Reminder: Lease Expiry Approaching',
//           message: `Dear ${firstName}, this is a reminder that your lease is approaching its end on ${leaseEnd.toDateString()}. Please make necessary arrangements or contact your landlord, ${landlord.firstName} ${landlord.lastName}, to discuss renewal or further steps.`,
//           html: `<p>Dear ${firstName},</p><p>This is a reminder that your lease is approaching its end on <strong>${leaseEnd.toDateString()}</strong>. Please make necessary arrangements or contact your landlord, ${landlord.firstName} ${landlord.lastName}, to discuss renewal or further steps.</p><p>Thank you,<br/>RentWave</p>`
//         };
  
//         // Send the email notification
//         await sendMail(mailOptions);
//       }
//     } catch (error) {
//       console.error('Error sending lease end reminder:', error);
//     }
//   };


const dueRentReminder = async () => {
  try {
    // Find tenants whose lease ends within the next 7 days
    const upcomingLeaseEndTenants = await tenantModel.find({
      leaseEnd: {
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Lease ending within the next 7 days
      }
    }).populate('landlord');

    // Send emails concurrently
    await Promise.all(upcomingLeaseEndTenants.map(async (tenant) => {
      if (!tenant) {
        console.error('Tenant data is null or undefined.');
        return; // Skip this iteration if tenant is null
      }

      const { firstName, email, leaseEnd, landlord } = tenant;

      // Check if landlord is null
      if (!landlord) {
        console.error(`Tenant ${firstName} does not have an associated landlord.`);
        return; // Skip this iteration if landlord is null
      }

      // Construct the email options for lease end reminder
      const mailOptions = {
        email: email,
        subject: 'Reminder: Lease Expiry Approaching',
        message: `Dear ${firstName}, this is a reminder that your lease is approaching its end on ${leaseEnd.toDateString()}. Please make necessary arrangements or contact your landlord, ${landlord.firstName} ${landlord.lastName}, to discuss renewal or further steps.`,
        html: `<p>Dear ${firstName},</p><p>This is a reminder that your lease is approaching its end on <strong>${leaseEnd.toDateString()}</strong>. Please make necessary arrangements or contact your landlord, ${landlord.firstName} ${landlord.lastName}, to discuss renewal or further steps.</p><p>Thank you,<br/>RentWave</p>`
      };

      // Send the email notification
      try {
        await sendMail(mailOptions);
      } catch (err) {
        console.error(`Failed to send email to ${email}:`, err);
      }
    }));
  } catch (error) {
    console.error('Error sending lease end reminder:', error);
  }
};




// Function to generate and send invoices for leases that end today
const generateAndSendInvoicesForToday = async () => {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find tenants whose lease end date is today
    const tenants = await tenantModel.find({ leaseEnd: today }).populate('property'); // Populate property to get rent price

    // Loop through the tenants and generate/send invoices
    for (const tenant of tenants) {
      const { firstName, lastName, email, property } = tenant;
      const rentAmount = property.price; // Use the price field from property
      
      // Create invoice details
      const invoice = {
        tenantName: `${firstName} ${lastName}`,
        tenantEmail: email,
        propertyAddress: property.address, // Assuming property has an address field
        dueDate: tenant.leaseEnd.toDateString(), // Lease end date as due date
        rentAmount,
        additionalCharges: 0,
        totalAmountDue: rentAmount,
        invoiceDate: today.toDateString(),
      };

      // Format the invoice message
      const invoiceMessage = `
        <p>Dear ${invoice.tenantName},</p>
        <p>This is your rent invoice for the property at <strong>${invoice.propertyAddress}</strong>:</p>
        <ul>
          <li><strong>Invoice Date:</strong> ${invoice.invoiceDate}</li>
          <li><strong>Due Date:</strong> ${invoice.dueDate}</li>
          <li><strong>Rent Amount:</strong> $${invoice.rentAmount.toFixed(2)}</li>
          <li><strong>Additional Charges:</strong> $${invoice.additionalCharges.toFixed(2)}</li>
          <li><strong>Total Amount Due:</strong> $${invoice.totalAmountDue.toFixed(2)}</li>
        </ul>
        <p>Please ensure the payment is made. If you have any questions or concerns, please contact us.</p>
        <p>Thank you,<br/>RentWave Team</p>
      `;

      // Send the invoice email
      await sendMail({
        to: invoice.tenantEmail,
        subject: 'Rent Invoice',
        html: invoiceMessage
      });

      console.log(`Invoice sent to ${invoice.tenantEmail} successfully.`);
    }
  } catch (error) {
    console.error('Error generating and sending invoices:', error.message);
  }
};




module.exports = {notifyDueRent,dueRentReminder, generateAndSendInvoicesForToday};
