// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpGet } from 'inversify-express-utils'
import nodemailer from 'nodemailer';
// Imports
import { mailer } from '@/resources/mailing/mailer';

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
            const email = req.session.user?.email;

            if (!token) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing token." });
            }

            if (!email) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing email." });
            }

            const info = await mailer(token, email);

            res.status(200);
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}