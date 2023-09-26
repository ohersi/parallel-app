// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPut, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import UpdateUserUsecase from '@/services/usecases/user/updateUser.usecase';
import validationMiddleware from '@/middleware/validation.middleware';
import userValidation from '@/resources/validations/user.validation';
import { moderate } from '@/middleware/moderation.middleware';
import { sessionAuth } from '@/middleware/auth.middleware';
import { update } from '@/resources/caching/cache';
import UserDTO from '@/dto/user.dto';
import { TYPES } from '@/utils/types';

@controller(`/users`)
export default class UpdateUserController {

    private readonly usecase: UpdateUserUsecase;

    constructor(@inject(TYPES.UPDATE_USER_USECASE) updateUserUsecase: UpdateUserUsecase) {
        this.usecase = updateUserUsecase;
    }

    @httpPut('/update', validationMiddleware(userValidation.update), sessionAuth, moderate)
    public async updateUser(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = req.session.user?.id;
            const user = req.body as UserDTO;
            const cacheTimespan = '15mins';

            if (!id) {
                res.status(401);
                return res.send({ error: { status: 401 }, message: `Unauthorized, no log in session.`});
            };
            
            const results = await this.usecase.execute(user, id!);

            // Update user cache
            await update('user', results?.id!, results, cacheTimespan);

            res.status(200);
            res.send("User has been updated.");
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /users/update:
 *   put:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - User
 *      summary: Update User
 *      description: Update user
 *      operationId: updateUser
 *      responses:
 *          200:
 *              description: Return update success message
 *              content:
 *                  application/json:
 *                     schema:
 *                       type: string
 *                       example: User has been updated.
 *                      
 *          401:
 *              description: Not authorized to make changes
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
 *                                          example: 401
 *                              message:
 *                                   type: string
 *                                   example: Unauthorized, no log in session.
 *          500:
 *              description: Server error
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: '#/components/schemas/ServerError'
 */