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
        const { taskId } = req.params;
        const { ownerId, title, description, userId } = req.body;

        const task = await TaskModel.findOne({ where: { taskId } });
        const oldOwner = await UserModel.findOne({ where: { userId: userId } });
        const newOwner = await UserModel.findOne({ where: { userId: ownerId } });

        if (!task) {
            res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.TaskNotFound);
            return;
        }

        if (!ownerId || !title || !description) {
            res.status(HttpCodes.BAD_REQUEST).json({ message: "Missing required fields" });
            return;
        }

        if (!newOwner) {
            res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.UserNotFound);
            return;
        }

        if (task.ownerId !== userId && userId !== oldOwner?.userId && userId !== UserRoles.Admin && userId !== UserRoles.Manager) {
            res.status(HttpCodes.FORBIDDEN).json({ message: "You do not have permission to update this task" });
            return;
        }

        if (task.ownerId !== ownerId) {
            if (oldOwner) {
                oldOwner.userTasksList = oldOwner.userTasksList.filter(
                    (taskInList: TaskInterface) => taskInList.taskId !== taskId
                );
                await oldOwner.save();
            } else {
                res.status(HttpCodes.NOT_FOUND).json({ message: "Old owner not found" });
                return;
            }

            if (newOwner) {
                const taskJson = task.toJSON();
                newOwner.userTasksList = [...newOwner.userTasksList, taskJson];
                await newOwner.save();
            } else {
                res.status(HttpCodes.NOT_FOUND).json({ message: "New owner not found" });
                return;
            }


            console.log("Type of userTasksList:", typeof newOwner.userTasksList);

            await task.update({ ownerId: newOwner.userId }); // Atualize a tarefa com o novo dono
        }


        await task.update({
            ownerId,
            title,
            description
        });

        logger.info(`Task updated successfully: ${taskId} by user: ${userId}`);
        res.status(HttpCodes.OK).json({
            message: 'Task updated successfully', task
        });

    } catch (error) {
        logger.error(`Error updating task: ${error}`);
        res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ error: SharedErrors.InternalServerError });
    }
};

export const deleteTaskById = async (req: Request, res: Response) => {
    try {
        const { taskId, ownerId } = req.params;
        const { userId } = req.body;

        const task = await TaskModel.findOne({ where: { taskId } });
        const user = await UserModel.findOne({ where: { userId } });

        if (!task) {
            res.status(HttpCodes.NOT_FOUND).json({ message: `Task with ID ${taskId} not found.` });
            return
        }

        if (!user) {
            res.status(HttpCodes.BAD_REQUEST).json({ message: SharedErrors.UserNotFound});
            return
        }

        if (task.ownerId === userId || user.role === UserRoles.Admin || user.role === UserRoles.Manager) {

            if (task.ownerId === ownerId) {
                const owner = await UserModel.findOne({ where: { userId: ownerId } });
                if (owner) {
                    owner.userTasksList = owner.userTasksList.filter((taskInList: TaskInterface) => taskInList.taskId !== taskId);
                    await owner.save();
                }
            }

            await TaskModel.destroy({ where: { taskId } });

            logger.info(`Task: ${taskId} deleted successfully by user: ${userId}`);
            res.status(HttpCodes.OK).json({ message: `Task ${taskId} deleted successfully.` });
            return
        }

        res.status(HttpCodes.FORBIDDEN).json({ message: "You do not have permission to delete this task." });
        return

    } catch (error) {
        logger.error(`Error deleting Task: ${error}`);
        res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
    }
};

