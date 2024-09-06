const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const sendPropertyUpdateMail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
      user: process.env.mailUser,
      pass: process.env.mailPassword,
    },
    secure: true,
  });

  // Read and compile the HTML template
  const templatePath = path.join(__dirname, 'helpers', 'propertyUpdateNotification.html');
  const template = fs.readFileSync(templatePath, 'utf8');
  const compiledTemplate = ejs.compile(template);
  
  // Insert property details into the HTML template
  const html = compiledTemplate(options.templateVariables);

  let mailOptions = {
    from: process.env.mailUser,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendPropertyUpdateMail;
