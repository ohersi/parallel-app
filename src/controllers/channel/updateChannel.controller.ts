// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPut, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import UpdateChannelUsecase from '../../services/usecases/channel/updateChannel.usecase';
import validationMiddleware from '../../middleware/validation.middleware';
import channelValidation from '../../resources/validations/channel.validation';
import { moderate } from '../../middleware/moderation.middleware';
import { sessionAuth } from '../../middleware/auth.middleware';
import ChannelDTO from '../../dto/channel.dto';
import { TYPES } from '../../utils/types';


@controller(`/api/v1/channels`)
export default class UpdateChannelController {

    private readonly usecase: UpdateChannelUsecase;

    constructor(@inject(TYPES.UPDATE_CHANNEL_USECASE) updateChannelUsecase: UpdateChannelUsecase) {
        this.usecase = updateChannelUsecase;
    }

    @httpPut('/:id/update', validationMiddleware(channelValidation.update), sessionAuth, moderate)
    public async updateChannel(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const id = parseInt(req.params.id);
            const userID = req.session.user?.id!;
            const channel = req.body as ChannelDTO;

            const results = await this.usecase.execute(id, userID, channel);
            res.status(200);
            res.send({ message: "Channel has been updated.", updated: results });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}