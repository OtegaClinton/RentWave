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
                background-color: #f4f4f4; /* Clean white background */
            }
            .header {
                background: #0033cc; /* Royal Blue */
                padding: 15px;
                text-align: center;
                border-bottom: 2px solid #4169e1; /* Darker shade of Royal Blue */
                color: #f4f4f4;
                border-radius: 10px 10px 0 0; /* Rounded top corners */
            }
            .content {
                padding: 20px;
                color: #333333;
            }
            .footer {
                background: #4169e1; /* Darker shade of Royal Blue */
                padding: 15px;
                text-align: center;
                border-top: 2px solid #0033cc; /* Royal Blue */
                font-size: 0.9em;
                color: #f4f4f4;
                border-radius: 0 0 10px 10px; /* Rounded bottom corners */
            }
            .button {
                display: inline-block;
                background-color: #0033cc; /* Royal Blue */
                color: #f4f4f4;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                transition: background-color 0.3s ease;
            }
            .button:hover {
                background-color: #002a80; /* Darker shade of Royal Blue */
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


