// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpDelete, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import DeleteUserUsecase from '../../services/usecases/user/deleteUser.usecase';
import { sessionAuth } from '../../middleware/auth.middleware';
import { TYPES } from '../../utils/types';

@controller(`/api/v1/users`)
export default class DeleteUserController {

    private readonly usecase: DeleteUserUsecase;

    constructor(@inject(TYPES.DELETE_USER_USECASE) deleteUserUsecase: DeleteUserUsecase) {
        this.usecase = deleteUserUsecase;
    }

    @httpDelete('/:id', sessionAuth)
    public async deleteUser(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            const userID = req.session.user?.id!;

            const results = await this.usecase.execute(id, userID);

            res.status(200);
            res.send({ message: "User has been deleted.", results: results });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}