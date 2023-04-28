// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpDelete, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import RemoveConnectionUsecase from '../../services/usecases/connection/removeConnection.usecase';
import { sessionAuth } from '../../middleware/auth.middleware';
import { TYPES } from '../../utils/types';


@controller(`/api/v1/blocks`)
export default class RemoveConnectionController {

    private readonly usecase: RemoveConnectionUsecase;

    constructor(@inject(TYPES.REMOVE_CONNECTION_USECASE) removeConnectionUsecase: RemoveConnectionUsecase) {
        this.usecase = removeConnectionUsecase;
    }

    @httpDelete('/:id/disconnect', sessionAuth)
    public async removeConnection(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const { channel } = req.query;
            if (!channel) {
                res.status(404);
                return res.send({ error: { status: 404 }, message: "Missing channel." });
            }
            const blockID = parseInt(req.params.id);
            const channelID = parseInt(channel.toString());
            const userID = req.session.user?.id!;

            const results = await this.usecase.execute(blockID, userID, channelID);

            res.status(200);
            res.send({ message: "Block has been disconnected from the channel." });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}