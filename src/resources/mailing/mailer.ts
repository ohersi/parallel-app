// Packages
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
// Imports
import '@/utils/env';

export const mailer = async (token: string, email: string): Promise<SMTPTransport.SentMessageInfo> => {

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAILER_EMAIL,
            pass: process.env.MAILER_PASS
        }
    })

    const url = `http://localhost:3000/api/v1/registration/confirm?token=${token}`
    const site = `http://localhost:8080/` // TODO: Change to site in prod

    let message = {
        from: process.env.MAILER_EMAIL, // sender address
        to: email, // list of receivers
        subject: "Complete your account registration - Parallel", // Subject line
        text: `localhost:3000/api/v1/registration/confirm?token=${token}`, // plain text body
        html: `Thank you for creating a Parallel account.
        <br/>
        <br/>
        To complete registration, click the link below: 
        <br/>
        <a href="${url}">Confirm email</a>
        <br/>
        <br/>
        - Parallel 
        <br/>
        <a href="${site}">${site}</a>`, // html body
    };

    try {
        let info = await transporter.sendMail(message); // remove await in prod for async 
        return info;
    }
    catch (error: any) {
        throw new Error(error.message);
    }
};