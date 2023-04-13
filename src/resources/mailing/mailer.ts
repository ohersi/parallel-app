import nodemailer from 'nodemailer';

export const mailer = async (token: string) => {
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

    let message = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "bar@example.com, baz@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: `localhost:3000/api/v1/registration/confirm?token=${token}`, // plain text body
        html: `<b>
        <a href="localhost:3000/api/v1/registration/confirm?token=${token}">Click here to verify email!</a>
        </b>`, // html body
    };

    let info = await transporter.sendMail(message);

    return info;
};