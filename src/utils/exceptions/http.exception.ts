/**
 * @openapi
 * components:
 *   schemas:
 *     ServerError:
 *       type: object
 *       properties:
 *         error:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "500"
 *         message:
 *           type: string
 *           example: Server error
 *       xml: servererror
 */
export default class HttpException extends Error {
    public status: number;
    public message: string;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.message = message;
    }
}