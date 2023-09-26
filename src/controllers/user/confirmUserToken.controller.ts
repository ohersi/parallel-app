// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpGet } from 'inversify-express-utils'
// Imports
import ConfirmUserTokenUseCase from '@/services/usecases/user/confirmUserToken.usecase';
import { TYPES } from '@/utils/types';
import { inject } from 'inversify';

@controller(`/registration`)
export default class ConfirmUserTokenController {

    private readonly usecase: ConfirmUserTokenUseCase;

    constructor(@inject(TYPES.CONFIRM_USER_TOKEN_USECASE) confirmUserTokenUsecase: ConfirmUserTokenUseCase) {
        this.usecase = confirmUserTokenUsecase;
    }

    @httpGet('/confirm')
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
            }   
            await this.usecase.execute(token.toString());
            
            res.status(200);
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
 *  /registration/confirm:
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
 *          200:
 *              description: User has successfully registered, redirect to completion page.
 *              headers:
 *                  Location:
 *                      description: URI of success registration.
 *                      schema:
 *                          type: string
 *                          format: uri  # Optional - use if the Location header is an absolute URI, starting with http(s)://
 *                      examples:
 *                          302ExpiredRefreshToken:
 *                              description: Success URI when user is registered.
 *                              value: 'www.<UIEndpoint>/registered/d3fe5c6959ae0ce502d6027a7693c3ebe4543f51a878d60004e133172'
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */