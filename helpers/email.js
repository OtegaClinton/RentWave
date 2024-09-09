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
      to: options.to, 
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



// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const sendMail = async (options) => {
//   try {
//     // Create a transporter object
//     const transporter = nodemailer.createTransport({
//       service: process.env.SERVICE, // Ensure this is correct
//       secure: process.env.SERVICE === 'gmail', // Set secure based on the service
//       auth: {
//         user: process.env.mailUser, 
//         pass: process.env.mailPassword, 
//       },
//     });

//     // Define the email options
//     const mailOptions = {
//       from: `"RentWave" <${process.env.mailUser}>`, 
//       to: options.to, // Ensure this matches the field used when calling sendMail
//       subject: options.subject, 
//       text: options.text, // Optional: ensure this is correctly set if used
//       html: options.html, 
//     };

//     // Debugging: Log mail options
//     console.log("Mail options:", mailOptions);

//     // Send the email
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent: " + info.response);
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// };

// module.exports = sendMail;

