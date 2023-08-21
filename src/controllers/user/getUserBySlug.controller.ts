// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
// Imports
import GetUserBySlugUseCase from '@/services/usecases/user/getUserBySlug.usecase';
import { convertToSlug } from '@/resources/helper/text-manipulation';
import { cache } from '@/resources/caching/cache';
import { TYPES } from '@/utils/types';

@controller(`/api/v1/users`)
export default class GetUserBySlugController {

    private readonly usecase: GetUserBySlugUseCase;

    constructor(@inject(TYPES.GET_USER_BY_SLUG_USECASE) getUserBySlugUseCase: GetUserBySlugUseCase) {
        this.usecase = getUserBySlugUseCase;
    }

    @httpGet('/name/:slug')
    public async getUserBySlug(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const slug = convertToSlug(req.params.slug);
            const cacheTimespan = '5mins';

            const results: any = await cache(`user:${slug}`, () => this.usecase.execute(slug), cacheTimespan);

            res.status(200);
            res.send(results);
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}