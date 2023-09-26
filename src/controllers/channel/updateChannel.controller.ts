// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPut, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import UpdateChannelUsecase from '@/services/usecases/channel/updateChannel.usecase';
import validationMiddleware from '@/middleware/validation.middleware';
import channelValidation from '@/resources/validations/channel.validation';
import { moderate } from '@/middleware/moderation.middleware';
import { sessionAuth } from '@/middleware/auth.middleware';
import ChannelDTO from '@/dto/channel.dto';
import { TYPES } from '@/utils/types';


@controller(`/channels`)
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
            const cacheTimespan = '30mins';

            if (!userID) {
                res.status(401);
                return res.send({ error: { status: 401 }, message: `Unauthorized, no log in session.`});
            };

            const results = await this.usecase.execute(id, userID, channel);

            res.status(200);
            res.send("Channel has been updated.");
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /channels/{id}/update:
 *   put:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - Channel
 *      summary: Update Channel
 *      description: Update channel
 *      operationId: updateChannel
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          description: ID of channel to update
 *          required: true
 *      responses:
 *          200:
 *              description: Return update success message
 *              content:
 *                  application/json:
 *                     schema:
 *                       type: string
 *                       example: Channel has been updated.
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