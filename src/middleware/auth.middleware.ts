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
        return res.status(401).send("Unauthorized access, not logged in.");
    }
    if (Object.keys(req.body).length && req.body.email) {
        if (req.session.user.email !== req.body?.email) {
            return res.status(401).send("Unauthorized access, not same user.");
        }
    }
    next();
}

export const roleAuth = (role: string) =>

    async (req: Request, res: Response, next: NextFunction) => {
        if (req.session?.user?.role !== role) {
            return res.status(403).send("Unauthorized access, insufficient permissions.");
        }
        next();
    }