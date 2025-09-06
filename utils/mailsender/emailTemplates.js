export const OTP_SENDER_TEMPLATE=(otp) =>{
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title> Your Password reset OTP is ${otp}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 10px;
              }
              .container {
                  background-color: #ffffff;
                  padding: 10px;
                  border-radius: 5px;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #333;
              }
              p {
                  color: #555;

              }
              .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  color: #888;
              }
              
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Password reset OTP Verification</h1>
              <p>Hello,</p>
              <p>Below is your one time passcode that you need to use to complete your password recovery. The verification code will be valid for 10 minutes. Please do not share this code with anyone.</p>
              
              <p>${otp}</p>
              <p>Thank you!</p>
          </div>
          
          <div class="footer">
              <p>This email was generated automatically. Please do not reply.</p>
          </div>
      </body>
      </html>
    `;
}
export const ADMIN_INVITE_TEMPLATE=(link) =>{
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title> You have been invited to become an admin</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 10px;
              }
              .container {
                  background-color: #ffffff;
                  padding: 10px;
                  border-radius: 5px;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #333;
              }
              p {
                  color: #555;

              }
              .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  color: #888;
              }
              
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Invitation to Join the AsterCart Admin Dashboard</h1>
              <p>Hello,</p>
              <p>click <a href="${link}">here</a> or  use this link to complete account creation. </p>
              
              <p>${link}</p>
              <p>Thank you!</p>
          </div>
          
          <div class="footer">
              <p>This email was generated automatically. Please do not reply.</p>
          </div>
      </body>
      </html>
    `;
}