// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpPost } from 'inversify-express-utils';

@controller(`/api/v1/users`)
export default class LogoutUserController {

    @httpPost('/logout')
    public async logoutUser(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {

        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            };
        })
        return res.send({ success: true });
    }
}