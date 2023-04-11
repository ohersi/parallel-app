// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpGet } from 'inversify-express-utils'
// Imports
import { verifyToken } from '../../resources/security/token';

@controller(`/api/v1/registration`)
export default class ConfirmUserTokenController {

    @httpGet('/confirm')
    public async confirmToken(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const token = req.query.token;
            if (token) {
                const results = await verifyToken(token.toString());
                res.status(200);
                res.send(results);
            }
            else {
                res.status(500);
                res.send({ error: { status: 500 }, message: "Missing token" });
            }
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}