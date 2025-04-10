import {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import HttpCodes from "http-status-codes";
import dotenv from 'dotenv';
import {SharedErrors} from '../shared/errors/shared-errors';
import UserModel from "../model/user.model";
import logger from "../shared/utils/logger";
import {UserRoles} from "../shared/utils/enums/roles";
dotenv.config()

const secret = String(process.env.JWT_SECRET);

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, userRole } = req.body;

        const existingEmail = await UserModel.findOne({ where: { email } });

        if (existingEmail) {
            res.status(HttpCodes.BAD_REQUEST).json({ error: SharedErrors.EmailAlreadyExists });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (!Object.values(UserRoles).includes(userRole)) {
            res.status(HttpCodes.BAD_REQUEST).json({ error: "Invalid role" });
            return;
        }

        const user = await UserModel.create({
            username,
            password: hashedPassword,
            email,
            role: userRole,
            userTasksList: []
        });

        logger.info(`User Created - ${__filename}`);
        res.status(HttpCodes.CREATED).json({
            message: 'User created successfully'
        });
    } catch (error) {
        logger.error(`Error in create user ${error} - ${__filename}`)
        res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ error: SharedErrors.InternalServerError });
        return;
    }
};

export const login = async (req: Request, res: Response)  => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ where: { email } });

        if (!user) {
            res.status(HttpCodes.NOT_FOUND).json({ error: SharedErrors.UserNotFound });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(HttpCodes.UNAUTHORIZED).json({ error: SharedErrors.AccessDenied });
            return;
        }

        const token = jwt.sign({ userId: user.userId }, secret, { expiresIn: '1h' });
        res.status(HttpCodes.OK).json({ token, name: user.username });
    } catch (error) {
        res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ error: 'Login failed' });
        return;
    }
};
