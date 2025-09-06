import {trp, sender} from './config.js';
import { ADMIN_INVITE_TEMPLATE, OTP_SENDER_TEMPLATE } from './emailTemplates.js';


export const sendOTP = async(email, otp) => {
    const mailOptions = {
        from: sender,
        to: email,
        subject: "Astercart Password Recovery OTP",
        html: OTP_SENDER_TEMPLATE(otp)
    }
    try {
        const info = await trp.sendMail(mailOptions)
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.log(error);
        throw new Error(`Error sending verification email: ${error}`);
        
    }
    
}
export const sendNewAdmin = async(email, link) => {
    const mailOptions = {
        from: sender,
        to: email,
        subject: "Astercart Admin Invite",
        html: ADMIN_INVITE_TEMPLATE(link)
    }
    try {
        const info = await trp.sendMail(mailOptions)
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.log(error);
        throw new Error(`Error sending verification email: ${error}`);
        
    }
    
}

