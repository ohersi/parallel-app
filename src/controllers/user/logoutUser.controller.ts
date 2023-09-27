// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpPost } from 'inversify-express-utils';

@controller(`/users`)
export default class LogoutUserController {

    @httpPost('/logout')
    public async logoutUser(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {

        try {
            req.session.destroy((err) => {
                if (err) {
                   throw new Error(err);
                };
            });

            res.status(200);
            return res.send({ success: true });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /users/logout:
 *   post:
 *      tags:
 *          - User
 *      summary: Logout user
 *      description: Destroys user session
 *      operationId: logoutUser
 *      responses:
 *          200:
 *              description: Return success status boolean
 *              content:
 *                  application/json:
 *                     schema:
 *                      type: object
 *                      properties:
 *                          success:
 *                             type: boolean
 *                             example: true
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */