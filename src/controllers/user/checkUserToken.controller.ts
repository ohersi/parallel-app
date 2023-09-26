// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpGet } from 'inversify-express-utils'
// Imports
import { verifyToken } from '@/resources/security/token';

@controller(`/registration`)
export default class CheckUserTokenController {

    @httpGet('/check')
    public async checkToken(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const { token } = req.query;

            if (!token) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing token" });
            }
            
            // Verify token
            const verifed = await verifyToken(token.toString());

            if (verifed === false) {
                res.status(423);
                return res.send({ error: { status: 423 }, message: "Expired token." });
            }

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
 *  /registration/check:
 *   get:
 *      tags:
 *          - User
 *      summary: Validate user token
 *      description: Validate user token
 *      operationId: checkToken
 *      parameters:
 *        - in: query
 *          name: token
 *          schema: 
 *            type: string
 *          description: Token to verify
 *          required: true
 *      responses:
 *          200:
 *              description: Return success status boolean
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                   type: boolean
 *                                   example: true
 *          423:
 *              description: Expired token
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
 *                                          example: 423
 *                              success:
 *                                   type: string
 *                                   example: Expired token.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */