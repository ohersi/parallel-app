// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpDelete, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import DeleteChannelUsecase from '../../services/usecases/channel/deleteChannel.usecase';
import { sessionAuth } from '../../middleware/auth.middleware';
import { TYPES } from '../../utils/types';


@controller(`/api/v1/channels`)
export default class DeleteChannelController {

    private readonly usecase: DeleteChannelUsecase;

    constructor(@inject(TYPES.DELETE_CHANNEL_USECASE) deleteChannelUsecase: DeleteChannelUsecase) {
        this.usecase = deleteChannelUsecase;
    }

    @httpDelete('/:id', sessionAuth)
    public async deleteChannel(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            const userID = req.session.user?.id!;

            await this.usecase.execute(id, userID);

            res.status(200);
            res.send({ message: "Channel has been deleted." });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}