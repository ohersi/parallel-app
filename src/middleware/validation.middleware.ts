import { Request, Response, NextFunction, RequestHandler } from "express";
import Joi from "joi";

const validationMiddleware = (schema: Joi.Schema): RequestHandler => {

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        const validationOptions = {
            abortEarly: false, // Prevents validation from ending after finding the first error, allows it to continue
            allowUnknown: true, // Allows validation to continue even if values not part of the schema
            stripUnknown: true // Removes the unknown elements from objects and arrays
        };

        try {
            // Validate the request body and pass Joi validation options
            const value = await schema.validateAsync(req.body, validationOptions);
            // Request body is updated with the validated schema
            req.body = value;
            // Continue with request
            next();
        }
        catch (e) {
            if (e instanceof Joi.ValidationError) {
                const errors: string[] = [];
                e.details.forEach((error: Joi.ValidationErrorItem) => {
                    errors.push(error.message)
                });
                res.status(400).send({ errors });
            }
            else {
               res.status(400).send(`Unexpected error: ${e}`)
               console.log("Unexpected error", e); 
            }
        }
    }
};

export default validationMiddleware;