import {Request, Response} from 'express';
import HttpCodes from "http-status-codes";
import {SharedErrors} from "../shared/errors/shared-errors";
import logger from "../shared/utils/logger";
import {TaskInterface} from "../interface/task.interface";
import TaskModel from "../model/task.model";
import UserModel from "../model/user.model";
import {UserRoles} from "../shared/utils/enums/roles";

const _fileName = module.filename.split("/").pop();

export const getTasks = async (req: Request, res: Response) => {
    try {
        const tasks: TaskInterface[] = await TaskModel.findAll();
        if (!tasks.length) {
            res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.UserNotFound);
            return;
        }

        logger.info(`Get tasks with successfully : ${__filename}`);
        res.status(HttpCodes.OK).json({ Tasks: tasks });
    } catch (error) {
        logger.error(`Error getting task: ${error} - ${__filename}`);
        res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
        return;
    }
}

export const getTaskById = async (req: Request, res: Response) => {
    const { taskId } = req.params
    try {
        const task = await TaskModel.findOne({ where: { taskId } });

        if (!task) {
            res.status(HttpCodes.NOT_FOUND).json(SharedErrors.TaskNotFound);
            return;
        }

        logger.info(`Get task with successfully : ${__filename}`);
        res.status(HttpCodes.OK).json(task);
    } catch (error) {
        logger.error(`Error getting task: ${error} - ${__filename}`);
        res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
        return;
    }
}

export const createTask = async (req: Request, res: Response) => {
    try {
        const { ownerId, title, description }: TaskInterface = req.body

        const user = await UserModel.findOne({ where: { userId: ownerId } });

        if (!user) {
            res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.UserNotFound);
            return;
        }

        if (user.role === UserRoles.Viewer) {
            res.status(HttpCodes.FORBIDDEN).json({
                message: "User does not have permission to create or edit tasks"
            });
            return;
        }

        const task = await TaskModel.create({
            ownerId,
            title,
            description
        });

        user.userTasksList.push(task);
        await user.save();
        await UserModel.update({ userTasksList: user.userTasksList }, { where: { userId: ownerId } });

        logger.info(`Task Created - ${_fileName}`);
        res.status(HttpCodes.CREATED).json({
            message: 'Task created successfully',
            task: task
        });
    } catch (error){
        logger.error(`Error in create task ${error} - ${_fileName}`)
        res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ error: SharedErrors.InternalServerError });
        return;
    }
}

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params
        const { ownerId, title, description } = req.body

        const task = await TaskModel.findOne({ where: { taskId } });
        const user = await UserModel.findOne({ where: { userId: ownerId} });

        if (!task) {
            res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.TaskNotFound);
            return;
        }

        if (!ownerId || !title || !description) {
            res.status(HttpCodes.BAD_REQUEST).json({ message: "Missing required fields" });
            return;
        }

        if (!user) {
            res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.UserNotFound);
            return;
        }

        await task.update({
            ownerId,
            title,
            description
        });

        logger.info(`User Created - ${_fileName}`);
        res.status(HttpCodes.CREATED).json({
            message: 'Task created successfully', task
        });
    }catch (error){
        logger.error(`Error in create task ${error} - ${_fileName}`)
        res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ error: SharedErrors.InternalServerError });
    }
}

export const deleteTaskById = async (req: Request, res: Response) => {
    try {
        const { taskId, ownerId } = req.params;

        const task = await TaskModel.findOne({ where: { taskId } });
        const user = await UserModel.findOne({ where: { userId: ownerId } });

        if (!task) {
            res.status(HttpCodes.NOT_FOUND).json({ message: `Task with ID ${taskId} not found.` });
            return
        }

        if (task.ownerId !== ownerId) {
            res.status(HttpCodes.FORBIDDEN).json({ message: "This task does not belong to the user." });
            return
        }

        await TaskModel.destroy({ where: { taskId } });

        if (user) {
            user.userTasksList = user.userTasksList.filter((taskInList: TaskInterface) => taskInList.taskId !== taskId);
            await user.save();
        }

        logger.info(`Task: ${taskId} deleted successfully by user: ${ownerId}`);
        res.status(HttpCodes.OK).json({ message: `Task ${taskId} deleted successfully.` });

    } catch (error) {
        logger.error(`Error deleting Task: ${error}`);
        res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
    }
};
