import { Request, Response, NextFunction } from "express";
import { TYPES_ENUM } from "../utils/types/enum";

export const paginate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    // Only users w/ admin privileges can set limit per page to be higher than 10
    if (req.session.user?.role !== TYPES_ENUM.ADMIN) {
        const limit = parseInt(req.query.limit as string);
        if (!limit || limit > 10) {
            req.query.limit = '10';
        }
    }
    next();
}