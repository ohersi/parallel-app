// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import AddConnectionUsecase from '../../services/usecases/connection/addConnection.usecase';
import { sessionAuth } from '../../middleware/auth.middleware';
import { TYPES } from '../../utils/types';


@controller(`/api/v1/blocks`)
export default class AddConnectionController {

    private readonly usecase: AddConnectionUsecase;

    constructor(@inject(TYPES.ADD_CONNECTION_USECASE) addConnectionUsecase: AddConnectionUsecase) {
        this.usecase = addConnectionUsecase;
    }

    @httpPost('/:id/connect', sessionAuth)
    public async addConnection(
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
            res.send(results);
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}