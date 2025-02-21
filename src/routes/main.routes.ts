import {Router} from 'express';
import HttpCodes from 'http-status-codes';
import {deleteUserById, getUserById, getUsers, updateUser} from "../controller/user.controller";
import {authenticateToken} from "../middleware/authToken.middleware";
import {TaskController} from "../controller/task.controller";

const mainRoutes = Router();

mainRoutes.get('/users', getUsers);
mainRoutes.get('/users/:userId', authenticateToken, getUserById);
mainRoutes.put('/user/:userId', authenticateToken, updateUser);
mainRoutes.delete('/user/:userId', authenticateToken, deleteUserById);

mainRoutes.get('/tasks', authenticateToken, TaskController.getTasks);
mainRoutes.get('/task/:taskId', authenticateToken, TaskController.getTaskById);
mainRoutes.post('/task', authenticateToken, TaskController.createTask);
mainRoutes.put('/task/:taskId', authenticateToken, TaskController.updateTask);
mainRoutes.delete('/task/:taskId/:ownerId', authenticateToken, TaskController.deleteTaskById);

mainRoutes.get('/health-check', (req, res) => {
    res.status(HttpCodes.OK).send('Server is healthy');
});

export default mainRoutes;