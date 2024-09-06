const userModel = require("../models/userModel");
const propertyModel = require("../models/propertyModel");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const paymentModel = require("../models/paymentModel");




const payRent = async (req, res) => {
  try {
    const { amount, dueDate, paymentMethod, notes } = req.body;

    // Get the authenticated tenant's ID from the request object
    const tenantId = req.tenant._id;

    // Fetch the property associated with the tenant
    const property = await propertyModel.findOne({ tenant: tenantId }).populate('listedBy');
    if (!property) {
      return res.status(404).json({ 
        message: 'Property not found for this tenant.' 
    });
    }

    const landlordId = property.listedBy._id; // Use the `listedBy` field to get the landlord ID
    const propertyId = property._id;

    // Simulate payment processing with a payment gateway
    const transactionResult = await processPayment({ amount, paymentMethod }); // Hypothetical function

    if (!transactionResult.success) {
      return res.status(400).json({ 
        message: 'Payment processing failed.', error: transactionResult.error 
    });
    }

    // Extract the transaction ID from the payment gateway response
    const transactionId = transactionResult.transactionId;

    // Create a new payment entry
    const newPayment = new Payment({
      amount,
      dueDate,
      tenant: tenantId,
      landlord: landlordId,
      property: propertyId,
      paymentMethod,
      transactionId,
      notes,
    });

    // Save the payment to the database
    await newPayment.save();

    // Generate the PDF receipt
    const receiptPath = await generateReceiptPDF(newPayment);

    // Send the receipt for download
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${newPayment._id}.pdf"`);
    res.sendFile(receiptPath);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Function to generate a PDF receipt
const generateReceiptPDF = async (payment) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const receiptPath = `./receipts/receipt-${payment._id}.pdf`; // Save to a receipts directory

    doc.pipe(fs.createWriteStream(receiptPath));

    // Add content to the PDF
    doc.fontSize(20).text('Payment Receipt', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Receipt ID: ${payment._id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Amount: $${payment.amount}`);
    doc.text(`Payment Method: ${payment.paymentMethod}`);
    doc.text(`Transaction ID: ${payment.transactionId}`);
    doc.text(`Property: ${payment.property}`);
    doc.text(`Landlord: ${payment.landlord}`);
    doc.text(`Tenant: ${payment.tenant}`);
    doc.text(`Notes: ${payment.notes || 'N/A'}`);
    doc.moveDown();

    doc.text('Thank you for your payment.', { align: 'center' });

    doc.end();

    doc.on('finish', () => resolve(receiptPath));
    doc.on('error', (error) => reject(error));
  });
};

module.exports = { payRent };
