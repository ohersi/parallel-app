// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, request, response, next, httpPost } from 'inversify-express-utils';
import { inject } from 'inversify';
// Imports
import LoginUserUseCase from '@/services/usecases/user/loginUser.usecase';
import validationMiddleware from '@/middleware/validation.middleware';
import userValidation from '@/resources/validations/user.validation';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class LoginUserController {

    private readonly usecase: LoginUserUseCase;

    constructor(@inject(TYPES.LOGIN_USER_USECASE) loginUserUseCase: LoginUserUseCase) {
        this.usecase = loginUserUseCase;
    }

    @httpPost('/login', validationMiddleware(userValidation.login))
    public async loginUser(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const results = await this.usecase.execute(req.body);

            req.session.user = {
                id: results.id!,
                email: results.email!,
                role: results.role!,
                token: results.token!,
            };
            delete results['role'];

            res.status(200);
            res.send(results);
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /users/login:
 *   post:
 *      tags:
 *          - User
 *      summary: Login user
 *      description: Returns logged in user data
 *      operationId: loginUser
 *      responses:
 *          200:
 *              description: Return logged in user data
 *              headers:
 *                Set-Cookie:
 *                  schema:
 *                     type: string
 *                     example: sid.cookie=abc12345; Path=/; HttpOnly
 *              content:
 *                  application/json:
 *                     schema:
 *                       allOf:
 *                       - $ref: '#/components/schemas/User'
 *                       - type: object
 *                         required:
 *                            - token
 *                         properties:
 *                           token:
 *                             type: string
 *                             example: token12345
 *          404:
 *              description: No users found
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
 *                                   example: No users found.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */