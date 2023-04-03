export default class UserException extends Error {
    public message: string;

    constructor(message: string) {
        super(message);
        this.message = message;
    }
}