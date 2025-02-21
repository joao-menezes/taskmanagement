import {Router} from 'express';
import {authLimiter} from "../middleware/auth.rate.limit.middleware";
import {login, registerUser} from "../controller/auth.controller";

const authRouter = Router();

authRouter.post('/register', authLimiter, registerUser);
authRouter.post('/login', login);

export default authRouter;