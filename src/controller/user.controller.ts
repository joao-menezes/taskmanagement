import { Request, Response } from 'express';
import UserModel from "../model/user.model";
import {SharedErrors} from "../shared/errors/shared-errors";
import HttpCodes from "http-status-codes";
import {UserInterface} from "../interface/user.interface";
import logger from "../shared/utils/logger";

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users: UserInterface[] = await UserModel.findAll();
        if (!users.length) {
            res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.UserNotFound);
            return;
        }

        logger.info(`Get user with successfully : ${__filename}`);
        res.status(HttpCodes.OK).json({ Users: users });
    } catch (error) {
        logger.error(`Error getting user: ${error} - ${__filename}`);
        res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
        return;
    }
};