import {Request, Response} from 'express';
import HttpCodes from "http-status-codes";
import {SharedErrors} from "../shared/errors/shared-errors";
import logger from "../shared/utils/logger";
import {TaskInterface} from "../interface/task.interface";
import TaskModel from "../model/task.model";
import UserModel from "../model/user.model";
import {UserRoles} from "../shared/utils/enums/roles";
import {TaskService} from "../services/task.service";



export class TaskController {
    static async getTasks(req: Request, res: Response){
        try {
            const {userId} = req.body;

            let tasks: TaskInterface[];
            const user = await UserModel.findOne({ where: { userId } });

            if (!userId || !user) {
                res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.UserNotFound);
                return;
            }

            if (user?.role === UserRoles.Admin || user?.role === UserRoles.Manager) {
                tasks = await TaskModel.findAll();
            } else {
                tasks = await TaskModel.findAll({ where: { ownerId: userId } });
            }

            if (!tasks.length) {
                res.status(HttpCodes.BAD_REQUEST).json(SharedErrors.TaskNotFound);
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

    static async getTaskById(req: Request, res: Response)  {
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

    static async createTask (req: Request, res: Response) {
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

            logger.info(`Task Created - ${__filename}`);
            res.status(HttpCodes.CREATED).json({
                message: 'Task created successfully',
                task: task
            });
        } catch (error){
            logger.error(`Error in create task ${error} - ${__filename}`)
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ error: SharedErrors.InternalServerError });
            return;
        }
    }

    static async updateTask (req: Request, res: Response){
        try {
            const { taskId } = req.params;
            const { ownerId, title, description, oldOwnerId, status } = req.body;

            const [task, oldOwner, newOwner] = await Promise.all([
                TaskModel.findOne({ where: { taskId } }),
                UserModel.findOne({ where: { userId: oldOwnerId } }),
                UserModel.findOne({ where: { userId: ownerId } })
            ]);

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

            if (task.ownerId !== oldOwnerId && oldOwnerId !== oldOwner?.userId && oldOwnerId !== UserRoles.Admin && oldOwnerId !== UserRoles.Manager) {
                res.status(HttpCodes.FORBIDDEN).json({ message: "You do not have permission to update this task" });
                return;
            }

            const hasChanges = task.ownerId !== ownerId || task.title !== title || task.description !== description || task.status !== status;

            if (!hasChanges) {
                res.status(HttpCodes.OK).json({ message: 'No changes detected', task });
                return;
            }

            const taskService = new TaskService();
            const result = await taskService.changeTaskOwner(task, oldOwner, newOwner);

            if (!result.success) {
                res.status(HttpCodes.BAD_REQUEST).json({ message: result.message });
                return
            }

            await task.update({
                ownerId: newOwner.userId,
                title,
                description,
                status
            });

            logger.info(`Task updated successfully: ${taskId} by user: ${oldOwnerId} - ${__filename}`);
            res.status(HttpCodes.OK).json({
                message: 'Task updated successfully', task
            });
        } catch (error) {
            logger.error(`Error updating task: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({ error: SharedErrors.InternalServerError });
        }
    };

    static async deleteTaskById(req: Request, res: Response)  {
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

                logger.info(`Task: ${taskId} deleted successfully by user: ${userId} - ${__filename}`);
                res.status(HttpCodes.OK).json({ message: `Task ${taskId} deleted successfully.` });
                return
            }

            res.status(HttpCodes.FORBIDDEN).json({ message: "You do not have permission to delete this task." });
            return

        } catch (error) {
            logger.error(`Error deleting Task: ${error} - ${__filename}`);
            res.status(HttpCodes.INTERNAL_SERVER_ERROR).json(SharedErrors.InternalServerError);
        }
    };

}