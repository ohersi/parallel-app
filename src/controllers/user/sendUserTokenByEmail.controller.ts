// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpGet } from 'inversify-express-utils'
// Imports
import { mailer } from '@/resources/mailing/mailer';

@controller(`/registration`)
export default class SendUserTokenByEmail {

    @httpGet('/')
    public async sendToken(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const token = req.session.user?.token;
            const email = req.session.user?.email;

            if (!token || !email) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing token or email." });
            };
            
            const info = await mailer(token, email);

            res.status(200);
            res.send({ success: true });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /registration:
 *   get:
 *      tags:
 *          - User
 *      summary: Send token to user email
 *      description: Sends token to user email
 *      operationId: sendToken
 *      responses:
 *          200:
 *              description: Return success status
 *              content:
 *                  application/json:
 *                     schema:
 *                       type: object
 *                       properties:
 *                          success:
 *                              type: boolean
 *                              example: true
 *          404:
 *              description: User not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: object
 *                                  properties:
 *                                      status:
 *                                          type: string
 *                                          example: 404
 *                              message:
 *                                   type: string
 *                                   example: Missing token or email.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */