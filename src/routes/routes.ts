import {Router} from 'express';
import HttpCodes from 'http-status-codes';
import {deleteUserById, getUserById, getUsers, updateUser} from "../controller/user.controller";
import {authenticateToken} from "../middleware/authToken.middleware";
import {
    createTask,
    deleteTaskById,
    getTaskById,
    getTasks,
    updateTask
} from "../controller/task.controller";

const routes = Router();
// const upload = multer({ dest: 'uploads/' });

routes.get('/users', getUsers);
routes.get('/users/:userId', authenticateToken, getUserById);
routes.put('/user/:userId', authenticateToken, updateUser);
routes.delete('/user/:userId', authenticateToken, deleteUserById);

routes.get('/tasks', authenticateToken, getTasks);
routes.get('/task/:taskId', authenticateToken, getTaskById);
routes.post('/task', authenticateToken, createTask);
routes.put('/task/:taskId', authenticateToken, updateTask);
routes.delete('/task/:taskId/:ownerId', authenticateToken, deleteTaskById);

routes.get('/health-check', (req, res) => {
    res.status(HttpCodes.OK).send('Server is healthy');
});

export default routes;