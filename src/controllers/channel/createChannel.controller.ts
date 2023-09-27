// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify';
// Imports
import CreateChannelUsecase from '@/services/usecases/channel/createChannel.usecase';
import validationMiddleware from '@/middleware/validation.middleware';
import channelValidation from '@/resources/validations/channel.validation';
import { moderate } from '@/middleware/moderation.middleware';
import { sessionAuth } from '@/middleware/auth.middleware';
import { TYPES } from '@/utils/types';


@controller(`/channels`)
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

            if (!userID) {
                res.status(401);
                return res.send({ error: { status: 401 }, message: `Unauthorized, no log in session.` });
            }

            const results = await this.usecase.execute(req.body, userID);

            res.status(201);
            res.send({ message: "Channel has been created." });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }
}

/**
 * @openapi
 *  /channels:
 *   post:
 *      security:
 *        - cookieAuth: []
 *      tags:
 *          - Channel
 *      summary: Create channel
 *      description: User must be logged in to preform action
 *      operationId: createChannel
 *      responses:
 *          201:
 *              description: Return success message
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                   type: string
 *                                   example: Channel has been created.
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