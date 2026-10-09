import nodemailer from "nodemailer";
import { APP_EMAIL, APP_PASSWORD, APPLICATION_NAME } from "../../../DB/config.js";




export const userEmailTrialsKey =({email, subject})=>{
  return `${userEmailKey({email , subject})}::Trials`
}




export const userEmailKey =({email, subject})=>{
  return `user::${email}::${subject}::OTP`
}



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD,
    },
});

export const sendEmail = async ({
    cc,
    bcc,
    to,
    subject,
    text,
    html,
    attachments = []
}) => {
    try {
        const info = await transporter.sendMail({
            from: `"${APPLICATION_NAME}" <${APP_EMAIL}>`,
            cc,
            bcc,
            to,
            subject,
            text,
            html,
            attachments
        });

        console.log("Message sent:", info.messageId);
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
};