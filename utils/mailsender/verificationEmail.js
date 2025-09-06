import nodemailer from "nodemailer";

const sendVerificationEmail = async (email, code) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.COMPANY_EMAIL,
            pass: process.env.COMPANY_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.COMPANY_EMAIL,
        to: email,
        subject: "Verify Your Email Address",
        html: `
            <p>Welcome! Please verify your email address to complete your registration.</p>
            <p>Your verification code is:</p>
            <h3>${code}</h3>
            <p>This code will expire in 10 minutes.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
};


export default sendVerificationEmail

