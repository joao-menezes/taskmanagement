import { NextFunction } from 'express';
import HttpCodes from 'http-status-codes';
import dotenv from 'dotenv';

dotenv.config();

export const routeAccessSecret = (req: any, res: any, next: NextFunction) => {
    const accessSecret = '1234567890';

    const providedSecret = req.headers['access-secret'] as string || req.body.accessSecret;

    if (!providedSecret) {
        res.status(HttpCodes.FORBIDDEN).json({
            message: 'Access denied, please provide access key'
        });
    }

    if (providedSecret !== accessSecret) {
        res.status(HttpCodes.UNAUTHORIZED).json({
            message: 'Wrong password.'
        });
    }
    next();
};