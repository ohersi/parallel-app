// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpGet } from 'inversify-express-utils'
// Imports
import ConfirmUserTokenUseCase from '@/services/usecases/user/confirmUserToken.usecase';
import { TYPES } from '@/utils/types';
import { inject } from 'inversify';

@controller(`/users`)
export default class ConfirmUserTokenController {

    private readonly usecase: ConfirmUserTokenUseCase;

    constructor(@inject(TYPES.CONFIRM_USER_TOKEN_USECASE) confirmUserTokenUsecase: ConfirmUserTokenUseCase) {
        this.usecase = confirmUserTokenUsecase;
    }

    @httpGet('/registration/confirm')
    public async confirmToken(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const { token } = req.query;

            if (!token) {
                res.status(500);
                return res.send({ error: { status: 500 }, message: "Missing token" });
            };
            
            await this.usecase.execute(token.toString());
            
            res.status(302);
            res.redirect(`${process.env.WHITELIST_ORIGINS}/registered/${token}`)
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /users/registration/confirm:
 *   get:
 *      tags:
 *          - User
 *      summary: Confirm user token
 *      description: Confirm user token
 *      operationId: confirmToken
 *      parameters:
 *        - in: query
 *          name: token
 *          schema: 
 *            type: string
 *          description: Token to verify
 *          required: true
 *      responses:
 *          302:
 *              description: User has successfully registered, redirect to external registered page.
 *              headers:
 *                  Location:
 *                      description: URL of success registration.
 *                      schema:
 *                          type: string
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */