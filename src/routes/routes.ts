import { Router, Request, Response } from 'express';
import HttpCodes from 'http-status-codes';
import {deleteUserById, getUserById, getUsers, updateUser} from "../controller/user.controller";
import {authenticateToken} from "../middleware/authToken.middleware";

const routes = Router();
// const upload = multer({ dest: 'uploads/' });

routes.get('/users', getUsers);
routes.get('/users/:userId', authenticateToken, getUserById);
routes.put('/user/:userId', authenticateToken, updateUser);
routes.delete('/user/:userId', authenticateToken, deleteUserById);


routes.get('/health-check', (req, res) => {
    res.status(HttpCodes.OK).send('Server is healthy');
});

export default routes;