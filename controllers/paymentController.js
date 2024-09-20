const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const paymentModel = require('../models/paymentModel');
const sendMail = require('../helpers/email');
const tenantModel = require('../models/tenantModel');

// Function to generate a PDF receipt
const generateReceiptPDF = async (payment) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument();
    const receiptsDir = path.join(__dirname, 'receipts');
    const receiptPath = path.join(receiptsDir, `receipt-${payment._id}.pdf`);

    // Ensure receipts directory exists
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(receiptPath);
    doc.pipe(writeStream);

    try {
      // Load the RentWave logo from URL
      const logoUrl = 'https://rent-wave.vercel.app/assets/logo-D2c4he43.png';
      const logoResponse = await axios.get(logoUrl, { responseType: 'arraybuffer' });
      const logoBuffer = Buffer.from(logoResponse.data, 'binary');
      doc.image(logoBuffer, {
        fit: [100, 100],
        align: 'left',
        valign: 'top'
      });

      // Fetch the stamp image from the Cloudinary URL
      const stampUrl = 'https://res.cloudinary.com/dobng9jwd/image/upload/v1726822949/Untitled_design-removebg-preview_fgtbmg.png';
      const stampResponse = await axios.get(stampUrl, { responseType: 'arraybuffer' });
      const stampBuffer = Buffer.from(stampResponse.data, 'binary');

      // Add the stamp as a watermark
      try {
        doc.image(stampBuffer, 450, 650, { // Adjust the positioning
          fit: [100, 100],
          opacity: 0.3 // Set opacity for watermark effect
        });
      } catch (error) {
        console.error('Error adding watermark image:', error);
      }

      doc.moveDown();
      doc.fontSize(26).font('Helvetica-Bold').text('Payment Receipt', { align: 'center' });
      doc.moveDown(2);

      // Add content to the PDF
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);
      doc.fontSize(14).font('Helvetica-Bold').text('Receipt Details:', { underline: true });
      doc.moveDown(1);

      doc.fontSize(12).font('Helvetica')
        .text(`Payee Name: ${payment.firstName} ${payment.lastName}`)
        .moveDown(0.5)
        .text(`Amount Paid: N${payment.amount}`)
        .moveDown(0.5)
        .text(`Receipt ID: ${payment._id}`)
        .moveDown(0.5)
        .text(`Date: ${new Date().toLocaleDateString()}`)
        .moveDown(0.5)
        .text(`Payment Method: ${payment.paymentMethod}`)
        .moveDown(0.5)
        .text(`Transaction ID: ${payment.transactionId}`)
        .moveDown(0.5)
        .text(`Property: ${payment.property}`)
        .moveDown(0.5)
        .text(`Landlord: ${payment.landlord}`)
        .moveDown(0.5)
        .text(`Tenant: ${payment.tenant}`)
        .moveDown(0.5)
        .text(`Notes: ${payment.notes || 'N/A'}`);

      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(2);
      doc.fontSize(16).font('Helvetica-Bold').text('Thank you for your payment!', { align: 'center' });

      doc.end();

      writeStream.on('finish', () => resolve(receiptPath));
      writeStream.on('error', (error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
};


const processPayment = async ({ amount, paymentMethod }) => {
  // Simulate a payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // For development, always return a success response
  return {
    success: true,
    transactionId: 'mockTransactionId123' // This would be returned by your actual payment gateway
  };
};

const payRent = async (req, res) => {
  let receiptPath;

  try {
    let { firstName, lastName, amount, paymentMethod, notes } = req.body;

    firstName = firstName ? firstName.trim() : '';
    lastName = lastName ? lastName.trim() : '';

    // Validate input fields
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount. Amount must be a positive number.' });
    }

    if (!paymentMethod || !['Bank Transfer', 'Credit Card', 'Cash', 'Other'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method. Accepted methods: Bank Transfer, Credit Card, Cash, Other.' });
    }

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      return res.status(400).json({ message: 'First name is required and must be a valid string.' });
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      return res.status(400).json({ message: 'Last name is required and must be a valid string.' });
    }

    // Get the authenticated tenant's ID from the request object
    const tenantId = req.user.id;

    // Fetch the tenant along with the associated property
    const tenant = await tenantModel.findById(tenantId).populate('property');

    // Check if the tenant exists and if the property is linked to the tenant
    if (!tenant || !tenant.property) {
      return res.status(404).json({ message: 'Property not found for this tenant.' });
    }

      // Validate if the provided name matches the tenant's name in the database
      if (firstName !== tenant.firstName || lastName !== tenant.lastName) {
        return res.status(400).json({ message: 'The provided name does not match the tenant\'s name.' });
      }

    const property = tenant.property;
    const landlordId = property.listedBy._id; // Assuming the property has a listedBy field
    const propertyId = property._id;

    // Retrieve due date based on the lease agreement (e.g., from property or tenant model)
    const dueDate = tenant.leaseEnd;

    // Simulate payment processing with a payment gateway
    const transactionResult = await processPayment({ amount, paymentMethod });

    if (!transactionResult.success) {
      return res.status(400).json({ message: 'Payment processing failed.', error: transactionResult.error });
    }

    // Extract the transaction ID from the payment gateway response
    const transactionId = transactionResult.transactionId;

    // Create a new payment entry
    const newPayment = new paymentModel({
      firstName,
      lastName,
      amount,
      dueDate,
      tenant: tenantId,
      landlord: landlordId,
      property: propertyId,
      paymentMethod,
      transactionId,
      notes,
      status: 'Paid' // Set the payment status to 'Paid'
    });

    // Save the payment to the database
    await newPayment.save();

    console.log('Sending email to:', tenant.email);

    // Generate the PDF receipt
    receiptPath = await generateReceiptPDF(newPayment);
    console.log('Generated receipt path:', receiptPath);

    // Check if the file exists
    if (!fs.existsSync(receiptPath)) {
      throw new Error('Receipt file not found.');
    }

    // Send the receipt via email
    const emailContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Confirmation - RentWave</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f0f4f8;
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
            background-color: #f4f4f4;
        }
        .header {
            background: #5F92DF;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            border-bottom: 2px solid #5F92DF;
            color: #f4f4f4;
            border-radius: 10px 10px 0 0;
        }
        .header img {
            width: 120px;
            height: 100px;
            object-fit: contain;
            position: absolute;
            left: 15px;
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .footer {
            background: #5F92DF;
            padding: 15px;
            text-align: center;
            border-top: 2px solid #5F92DF;
            font-size: 0.9em;
            color: #f4f4f4;
            border-radius: 0 0 10px 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
            <h1>Payment Confirmation</h1>
        </div>
        <div class="content">
            <p>Dear ${firstName} ${lastName},</p>
            <p>We have received your payment successfully. Thank you for completing the transaction.</p>
            <p>Attached to this email is your payment receipt for your records.</p>
            <p>If you have any questions or need further assistance, feel free to reach out to us.</p>
            <p>Thank you for choosing RentWave. We appreciate your prompt payment!</p>
            <p>Best regards,<br>The RentWave Team</p>
        </div>
        <div class="footer">
            RentWave - Making Rental Management Easier
        </div>
    </div>
</body>
</html>`;

    console.log('Sending email to:', tenant.email);

    await sendMail({
      to: tenant.email,
      subject: 'Your Payment Receipt',
      html: emailContent,
      attachments: [
        {
          filename: `receipt-${newPayment._id}.pdf`,
          path: receiptPath,
          contentType: 'application/pdf'
        }
      ]
    });

    console.log('Email sent successfully.');

    res.status(200).json({ message: 'Payment processed and receipt sent successfully.' });

  } catch (error) {
    console.error('Error occurred during payment process:', error);
    if (receiptPath && fs.existsSync(receiptPath)) {
      fs.unlinkSync(receiptPath); 
    }
    res.status(500).json({ message: 'An error occurred while processing payment and sending receipt.', error });
  }
};

module.exports = { payRent };
