import { TaskInterface } from "../interface/task.interface";
import UserModel from "../model/user.model";
import TaskModel from "../model/task.model";

export class TaskService {
    async changeTaskOwner(task: TaskModel, oldOwner: UserModel | null, newOwner: UserModel) {

        if (!oldOwner) {
            return {
                success: false,
                message: "Old owner not found"
            };
        }

        if (!newOwner) {
            return {
                success: false,
                message: "New owner not found"
            };
        }

        oldOwner.userTasksList = oldOwner.userTasksList.filter((taskInList: TaskInterface) => taskInList.taskId !== task.taskId);
        await oldOwner.save();

        const isTaskAlreadyAssigned = newOwner.userTasksList.some((taskInList: TaskInterface) => taskInList.taskId === task.taskId);

        if (!isTaskAlreadyAssigned) {
            const taskJson = task.toJSON();
            newOwner.userTasksList = [...newOwner.userTasksList, taskJson];
            await newOwner.save();
        }

        return {
            success: true
        };
    }
}
