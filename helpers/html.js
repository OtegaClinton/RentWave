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
            background-color: #f0f4f8;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px; /* Set a max-width for larger screens */
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #d0dbe1;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
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
            width: 100px; /* Adjust logo size for mobile */
            height: auto;
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
        .button {
            display: inline-block;
            background-color: #5F92DF;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #002a80;
        }

        /* Responsive adjustments for smaller screens */
        @media (max-width: 600px) {
            .container {
                width: 90%;
                margin: 10px auto;
            }
            .header img {
                width: 80px; /* Adjust logo size for smaller screens */
            }
            .content {
                padding: 10px;
            }
            .button {
                padding: 10px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
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
<html>
<head>
    <meta charset="UTF-8">
    <title>Re-verify Your Email - RentWave</title>
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
            max-width: 800px; /* Maximum width for large screens */
            width: 100%; /* Ensure it takes full width on mobile */
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #d0dbe1;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            background-color: #ffffff; /* Clean white background */
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
        .button {
            display: inline-block;
            background-color: #5F92DF; /* Royal Blue */
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #002a80; /* Darker shade of Royal Blue */
        }

        /* Media query for mobile responsiveness */
        @media (max-width: 600px) {
            .container {
                width: 90%; /* Reduce width for smaller screens */
                margin: 10px auto;
                padding: 10px; /* Reduce padding for mobile */
            }
            .header, .footer {
                padding: 10px;
            }
            .header h1 {
                font-size: 1.5rem; /* Reduce font size for the header */
            }
            .content {
                padding: 15px;
            }
            .button {
                padding: 10px 20px; /* Adjust button size for smaller screens */
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
            <h1>Welcome to RENTWAVE!</h1>
        </div>
        <div class="content">
            <p>Hello ${firstName},</p>
            <p>We noticed that you haven't verified your email address yet. To ensure your account security and to access all of RentWave's features, please re-verify your email by clicking the button below.</p>
            <p>Simply click the button below to complete the verification process:</p>
            <p>
                <a href="${reverifyLink}" class="button">Re-verify My Email</a>
            </p>
            <p>If you did not request this, please ignore this email or contact our support team.</p>
            <p>Best regards,<br>RentWave Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  };
  


 const resetPasswordhtml = (resetLink,userName)=>{
    return
    `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password - RentWave</title>
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
            max-width: 800px; /* Maximum width for large screens */
            width: 100%; /* Ensure it adapts to screen size */
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
        .button {
            display: inline-block;
            background-color: #5F92DF; /* Royal Blue */
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #002a80; /* Darker shade of Royal Blue */
        }

        /* Media query for mobile responsiveness */
        @media (max-width: 600px) {
            .container {
                width: 90%; /* Reduce width for smaller screens */
                margin: 10px auto;
                padding: 10px; /* Reduce padding for mobile */
            }
            .header, .footer {
                padding: 10px;
            }
            .header h1 {
                font-size: 1.5rem; /* Reduce font size for the header */
            }
            .content {
                padding: 15px;
            }
            .button {
                padding: 10px 20px; /* Adjust button size for smaller screens */
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://rent-wave.vercel.app/assets/logo-D2c4he43.png" alt="RentWave Logo">
            <h1>Reset Your Password</h1>
        </div>
        <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for your RentWave account. Click the button below to reset your password:</p>
            <p>
                <a href="${resetLink}" class="button">Reset My Password</a>
            </p>
            <p>If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
            <p>This password reset link will expire in 24 hours for security purposes.</p>
            <p>Best regards,<br>RentWave Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} RentWave. All rights reserved.</p>
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


