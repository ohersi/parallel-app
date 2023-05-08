// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import CreateChannelUsecase from '../../services/usecases/channel/createChannel.usecase';
import validationMiddleware from '../../middleware/validation.middleware';
import channelValidation from '../../resources/validations/channel.validation';
import { moderate } from '../../middleware/moderation.middleware';
import { sessionAuth } from '../../middleware/auth.middleware';
import { TYPES } from '../../utils/types';


@controller(`/api/v1/channels`)
export default class CreateChannelController {

    private readonly usecase: CreateChannelUsecase;

    constructor(@inject(TYPES.CREATE_CHANNEL_USECASE) createChannelUsecase: CreateChannelUsecase) {
        this.usecase = createChannelUsecase;
    }

    @httpPost('/', sessionAuth, validationMiddleware(channelValidation.create), moderate)
    public async createChannel(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const userID = req.session.user?.id!;
            
            const results = await this.usecase.execute(req.body, userID);

            res.status(201);
            res.send(results);
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}