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
        to: tenant.email,
        subject: 'Rent Due Reminder',
        message: `Dear ${tenant.firstName}, this is a reminder that your rent of ${amount} is due on ${dueDate.toDateString()}. Please ensure payment is made to avoid any late fees.`,
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rent Due Reminder - RentWave</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f0f4f8; /* Light background for contrast */
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #d0dbe1;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            background-color: #ffff; /* Clean white background */
        }
        .header {
            background: #5F92DF; /* Royal Blue */
            padding: 15px;
            display: flex;
            align-items: center; /* Align items vertically */
            justify-content: center; /* Center content horizontally */
            position: relative; /* Allows positioning of the logo */
            border-bottom: 2px solid #5F92DF; /* Darker shade of Royal Blue */
            color: #f4f4f4;
            border-radius: 10px 10px 0 0; /* Rounded top corners */
        }
        .header img {
            width: 120px;
            height: 100px;
            object-fit: contain;
            position: absolute;
            left: 15px; /* Position logo on the left */
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .footer {
            background: #5F92DF; /* Darker shade of Royal Blue */
            padding: 15px;
            text-align: center;
            border-top: 2px solid #5F92DF; /* Royal Blue */
            font-size: 0.9em;
            color: #f4f4f4;
            border-radius: 0 0 10px 10px; /* Rounded bottom corners */
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
            <h1>Rent Due Reminder</h1>
        </div>
        <div class="content">
            <p>Dear ${tenant.firstName},</p>
            <p>This is a reminder that your rent of <strong>${amount}</strong> is due on <strong>${dueDate.toDateString()}</strong>. Please ensure payment is made to avoid any late fees.</p>
            <p>If you have any questions or need assistance, feel free to contact us.</p>
            <p>Thank you,<br>RentWave Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
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
        to: email,
        subject: 'Reminder: Lease Expiry Approaching',
        message: `Dear ${firstName}, this is a reminder that your lease is approaching its end on ${leaseEnd.toDateString()}. Please make necessary arrangements or contact your landlord, ${landlord.firstName} ${landlord.lastName}, to discuss renewal or further steps.`,
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lease End Reminder - RentWave</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f0f4f8; /* Light background for contrast */
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #d0dbe1;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            background-color: #ffff; /* Clean white background */
        }
        .header {
            background: #5F92DF; /* Royal Blue */
            padding: 15px;
            display: flex;
            align-items: center; /* Align items vertically */
            justify-content: center; /* Center content horizontally */
            position: relative; /* Allows positioning of the logo */
            border-bottom: 2px solid #5F92DF; /* Darker shade of Royal Blue */
            color: #f4f4f4;
            border-radius: 10px 10px 0 0; /* Rounded top corners */
        }
        .header img {
            width: 120px;
            height: 100px;
            object-fit: contain;
            position: absolute;
            left: 15px; /* Position logo on the left */
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .footer {
            background: #5F92DF; /* Darker shade of Royal Blue */
            padding: 15px;
            text-align: center;
            border-top: 2px solid #5F92DF; /* Royal Blue */
            font-size: 0.9em;
            color: #f4f4f4;
            border-radius: 0 0 10px 10px; /* Rounded bottom corners */
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
            <h1>Lease End Reminder</h1>
        </div>
        <div class="content">
            <p>Dear ${firstName},</p>
            <p>This is a reminder that your lease is approaching its end on <strong>${leaseEnd.toDateString()}</strong>. Please make necessary arrangements or contact your landlord, ${landlord.firstName} ${landlord.lastName}, to discuss renewal or further steps.</p>
            <p>If you have any questions or need assistance, feel free to reach out to us.</p>
            <p>Thank you,<br>RentWave Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
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
        <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rent Invoice - RentWave</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f0f4f8; /* Light background for contrast */
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #d0dbe1;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            background-color: #ffff; /* Clean white background */
        }
        .header {
            background: #5F92DF; /* Royal Blue */
            padding: 15px;
            display: flex;
            align-items: center; /* Align items vertically */
            justify-content: center; /* Center content horizontally */
            position: relative; /* Allows positioning of the logo */
            border-bottom: 2px solid #5F92DF; /* Darker shade of Royal Blue */
            color: #f4f4f4;
            border-radius: 10px 10px 0 0; /* Rounded top corners */
        }
        .header img {
            width: 120px;
            height: 100px;
            object-fit: contain;
            position: absolute;
            left: 15px; /* Position logo on the left */
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .footer {
            background: #5F92DF; /* Darker shade of Royal Blue */
            padding: 15px;
            text-align: center;
            border-top: 2px solid #5F92DF; /* Royal Blue */
            font-size: 0.9em;
            color: #f4f4f4;
            border-radius: 0 0 10px 10px; /* Rounded bottom corners */
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
            <h1>Rent Invoice</h1>
        </div>
        <div class="content">
            <p>Dear ${invoice.tenantName},</p>
            <p>This is your rent invoice for the property at <strong>${invoice.propertyAddress}</strong>:</p>
            <ul>
                <li><strong>Invoice Date:</strong> ${invoice.invoiceDate}</li>
                <li><strong>Due Date:</strong> ${invoice.dueDate}</li>
                <li><strong>Rent Amount:</strong> $${invoice.rentAmount.toFixed(2)}</li>
                <li><strong>Additional Charges:</strong> $${invoice.additionalCharges.toFixed(2)}</li>
                <li><strong>Total Amount Due:</strong> $${invoice.totalAmountDue.toFixed(2)}</li>
            </ul>
            <p>Please ensure the payment is made by the due date. If you have any questions or concerns, please contact us.</p>
            <p>Thank you,<br>RentWave Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
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
