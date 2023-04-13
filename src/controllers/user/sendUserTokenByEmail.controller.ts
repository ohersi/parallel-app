// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpGet } from 'inversify-express-utils'
import nodemailer from 'nodemailer';
// Imports
import { mailer } from '../../resources/mailing/mailer';

@controller(`/api/v1/registration`)
export default class SendUserTokenByEmail {

    @httpGet('/')
    public async confirmToken(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const token = req.session.user?.token;

            if (!token) {
                res.status(500);
                return res.send({ error: { status: 500 }, message: "Missing token." });
            }

            const info = await mailer(token);
            res.status(200);
            res.send(
                {
                    message: "Sent verification email.",
                    info: info.messageId,
                    preview: nodemailer.getTestMessageUrl(info)
                }
            )
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}