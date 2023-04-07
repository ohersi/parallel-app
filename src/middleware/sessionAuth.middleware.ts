import { NextFunction, Request, Response } from 'express';

declare module "express-session" {
    interface SessionData {
        user: {
            id: number
        };
    }
}

export const sessionAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.user) {
        return res.status(401).send("Unauthorized access");
    }
    next();
}