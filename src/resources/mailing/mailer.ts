import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const mailer = async (token: string): Promise<SMTPTransport.SentMessageInfo> => {
    // Testing account
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    }); 

    const url = `localhost:3000/api/v1/registration/confirm?token=${token}`

    let message = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "bar@example.com, baz@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: `localhost:3000/api/v1/registration/confirm?token=${token}`, // plain text body
        html: `Please click the link to confirm your email: <a href="${url}">Confirm email!</a>`, // html body
    };

    try {
        let info = await transporter.sendMail(message); // remove await in prod for async 
        return info;
    }
    catch (error: any) {
        throw new Error(error.message);
    }
};