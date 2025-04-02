import {Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import HttpCodes from 'http-status-codes';
import {SharedErrors} from '../shared/errors/shared-errors'
import dotenv from 'dotenv';
import logger from "../shared/utils/logger";

dotenv.config();

const secret = String(process.env.JWT_SECRET);

export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        res.status(HttpCodes.UNAUTHORIZED).json(SharedErrors.AccessDenied);
        return
    }
    try {
        const decoded = jwt.verify(token, secret) as { userId: string };

        req.user = decoded;
        req.userId = decoded.userId;

        next();
    } catch (error) {
        logger.info(`Error in token: ${error} - ${__filename}`);
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(HttpCodes.UNAUTHORIZED).json({ message: SharedErrors.InvalidToken });
            return
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(HttpCodes.UNAUTHORIZED).json({ message: 'Token expirado' });
            return
        } else {
            res.status(HttpCodes.BAD_REQUEST).json({ message: 'Erro no processamento do token' });
            return
        }
    }
};