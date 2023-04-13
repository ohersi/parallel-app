import { NextFunction, Request, Response } from 'express';

declare module "express-session" {
    interface SessionData {
        user: {
            id: number,
            role: string,
            token?: string,
        };
    }
}

export const sessionAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.user) {
        return res.status(401).send("Unauthorized access, not logged in.");
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