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

export const getUserById = async (req: any, res: any) => {
    const { userId } = req.params;

    try {
        const user =  await UserModel.findOne({ where: { userId } });

        if (!user) return res.status(HttpCodes.NOT_FOUND).json(SharedErrors.UserNotFound);

        return res.status(HttpCodes.OK).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
    }
};

export const updateUser = async (req: any, res: any) => {
    const { userId } = req.params;
    const { username, email, password } = req.body;

    try {
        const user = await UserModel.findOne({ where: { userId } });
        const emailAlreadyExist = await UserModel.findOne({where: { email }})

        if (!user) {
            return res.status(HttpCodes.NOT_FOUND).json(SharedErrors.UserNotFound);
        }

        if (emailAlreadyExist) {
            return res.status(HttpCodes.NOT_FOUND).json(SharedErrors.EmailAlreadyExists);
        }

        await user.update({
            username,
            email,
            password,
        });

        return res.status(HttpCodes.OK).json({ message: 'user updated', user });
    } catch (error) {
        console.error('Error in found users:', error);
        return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
    }
};

export const deleteUserById = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const deletedCount = await UserModel.destroy({
            where: {
                userId: userId,
            },
        });

        if (!deletedCount) {
            res.status(HttpCodes.NOT_FOUND).json({ message: `User with ID ${userId} not found.`, });
            return;
        }

        logger.info(`User: ${userId} deleted successfully: ${__filename}`);
        res.status(HttpCodes.OK).json({  message: `User: ${userId} deleted successfully.`});
    } catch (error) {
        logger.error(`Error deleting user with ID ${req.params.userId}: ${error} - ${__filename}`);
        res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
        return;
    }
};
