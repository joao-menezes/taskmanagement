import {Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import HttpCodes from 'http-status-codes';
import {SharedErrors} from '../shared/errors/shared-errors'
import dotenv from 'dotenv';
import {UserRoles} from "../shared/utils/consts/roles";

dotenv.config();

const secret = String(process.env.JWT_SECRET);

export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        res.status(HttpCodes.UNAUTHORIZED).json(SharedErrors.AccessDenied);
    }
    try {
        req.user = jwt.verify(token, secret);
        next();
    } catch (error) {
        res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.InvalidToken);
    }
};
