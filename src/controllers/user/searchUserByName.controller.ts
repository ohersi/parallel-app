// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import SearchUserByNameUsecase from '@/services/usecases/user/searchUserByName.usecase';
import { TYPES } from '@/utils/types';

@controller(`/search`)
export default class SearchUserByNameController {

    private readonly usecase: SearchUserByNameUsecase;

    constructor(@inject(TYPES.SEARCH_USER_BY_NAME_USECASE) searchUserByNameUsecase: SearchUserByNameUsecase) {
        this.usecase = searchUserByNameUsecase;
    }

    @httpGet('/users')
    public async searchUserByName(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const name = req.query.name as string;
            if (!name) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `Missing name to search for.` });
            }

            const results = await this.usecase.execute(name);

            if (Array.isArray(results) && !results.length) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: `No users found with that that name: ${name}` });
            }
            res.status(200);
            res.send(results);
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}