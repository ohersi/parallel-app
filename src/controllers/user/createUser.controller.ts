// Packages
import { Request, Response, NextFunction } from 'express';
import { controller, httpPost, request, response, next } from 'inversify-express-utils'
import { inject } from 'inversify'
import nodemailer from 'nodemailer';
// Imports
import CreateUserUseCase from "@/services/usecases/user/createUser.usecase";
import validationMiddleware from '@/middleware/validation.middleware';
import userValidation from '@/resources/validations/user.validation';
import { moderate } from '@/middleware/moderation.middleware';
import { mailer } from '@/resources/mailing/mailer';
import { TYPES } from '@/utils/types';

@controller(`/api/v1/users`)
export default class CreateUserController {

    private readonly usecase: CreateUserUseCase;

    constructor(@inject(TYPES.CREATE_USER_USECASE) createUserUsecase: CreateUserUseCase) {
        this.usecase = createUserUsecase;
    }

    @httpPost('/', validationMiddleware(userValidation.create), moderate)
    public async createUser(
        @request() req: Request,
        @response() res: Response,
        @next() next: NextFunction)
        : Promise<Response | void> {
        try {
            const results = await this.usecase.execute(req.body);

            let info = await mailer(results.token, results.email);
            
            res.status(201);
            res.send({
                message: "User was created, you should recieve an email with your verification link.",
                info: info.messageId,
                preview: nodemailer.getTestMessageUrl(info)
            });
        }
        catch (err: any) {
            res.status(500);
            res.send({ error: { status: 500 }, message: err.message });
        }
    }

}