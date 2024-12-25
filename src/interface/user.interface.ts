import {TaskInterface} from "./task.interface";

export interface UserInterface {
    userId: string;
    username: string;
    password: string;
    email: string;
    tasksConcluded: number;
    role: number;
    userTasksList: TaskInterface[];
}
