import { Router, Request, Response } from 'express';
import HttpCodes from 'http-status-codes';
import {getUsers} from "../controller/user.controller";

const routes = Router();
// const upload = multer({ dest: 'uploads/' });

routes.get('/users', getUsers);

routes.get('/health-check', (req, res) => {
    res.status(HttpCodes.OK).send('Server is healthy');
});

export default routes;