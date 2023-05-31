import { NextFunction, Request, Response } from 'express';

declare module "express-session" {
    interface SessionData {
        user: {
            id: number,
            email: string,
            role: string,
            token?: string,
        };
    }
}

export const sessionAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.user) {
        res.status(401);
        return res.send("Unauthorized access, not logged in.");
    };
    if (!req.session.user.id) {
        res.status(401);
        return res.send("No session user id found.");
    };
    next();
}

export const roleAuth = (role: string) =>

    async (req: Request, res: Response, next: NextFunction) => {
        if (req.session?.user?.role !== role) {
            return res.status(403).send("Unauthorized access, insufficient permissions.");
        }
        next();
    }