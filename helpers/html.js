const html = (verifyLink,firstName)=>{
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Welcome to RentWave</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #2c2c2c; /* Dark background */
                margin: 0;
                padding: 0;
            }
            .container {
                width: 80%;
                margin: 20px auto; /* Add some top margin */
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                background-color: #f4f4f4; /* Light grey background */
            }
            .header {
                background: #333333;
                padding: 10px;
                text-align: center;
                border-bottom: 1px solid #ddd;
                color: #ffffff;
            }
            .content {
                padding: 20px;
                color: #333333;
            }
            .footer {
                background: #333333;
                padding: 10px;
                text-align: center;
                border-top: 1px solid #ddd;
                font-size: 0.9em;
                color: #cccccc;
            }
            .button {
                display: inline-block;
                background-color: #000000;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to RENTWAVE!</h1>
            </div>
            <div class="content">
                <p>Hello ${firstName},</p>
                <p>Thank you for signing up for RentWave. We are excited to have you on board.</p>
                <p>Please click the button below to verify your account:</p>
                <p>
                    <a href="${verifyLink}" class="button">Verify My Account</a>
                </p>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,<br>RentWave Team</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
                
            </div>
        </div>
    </body>
    </html>
    `
};



const reverifyHtml = (reverifyLink, firstName) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  color: #333;
                  line-height: 1.6;
                  padding: 20px;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: #fff;
                  padding: 20px;
                  border-radius: 5px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                  text-align: center;
                  padding: 10px 0;
                  border-bottom: 1px solid #ddd;
              }
              .header h1 {
                  margin: 0;
                  font-size: 24px;
              }
              .content {
                  margin: 20px 0;
              }
              .content p {
                  margin: 10px 0;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  color: #fff;
                  background-color: #007bff;
                  border-radius: 5px;
                  text-decoration: none;
              }
              .footer {
                  text-align: center;
                  padding: 10px 0;
                  border-top: 1px solid #ddd;
                  margin-top: 20px;
              }
              .footer p {
                  margin: 5px 0;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Email Verification</h1>
              </div>
              <div class="content">
                  <p>Hi ${firstName},</p>
                  <p>Thank you for registering with us. Please click the button below to verify your email address:</p>
                  <p><a href="${reverifyLink}" class="button">Verify Email</a></p>
                  <p>If you did not request this email, please ignore it.</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} BoamtNest. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  };
  


 const resetPasswordhtml = (resetLink,userName)=>{
    return
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #007bff;
        }
        p {
            font-size: 16px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Password Reset Request</h1>
        <p>Hello {${userName}},</p>
        <p>We received a request to reset your password. If you did not request this change, please ignore this email.</p>
        <p>To reset your password, please click the link below:</p>
        <a href="{${resetLink}}" class="button">Reset Password</a>
        <p>If you have any questions, feel free to contact our support team.</p>
        <div class="footer">
            <p>Thank you,<br>PrimeNest Team</p>
        </div>
    </div>
</body>
</html>
`};
 


 
 
 module.exports ={ 
    html,
    reverifyHtml,
    resetPasswordhtml,
    
    
};


