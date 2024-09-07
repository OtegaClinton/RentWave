const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async (options) => {
  try {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE, 
      secure: true, 
      auth: {
        user: process.env.mailUser, 
        pass: process.env.mailPassword, 
      },
    });

    // Define the email options
    const mailOptions = {
      from: `"RentWave" <${process.env.mailUser}>`, 
      to: options.email, 
      subject: options.subject, 
      text: options.message, 
      html: options.html, 
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendMail;
