import authRouter from "./auth.routes";
import mainRoutes from "./main.routes";
import { authenticateToken } from "../middleware/authToken.middleware";
import HttpCodes from "http-status-codes";

export const routesConfig = [
    {
        path: "/api",
        router: mainRoutes,
        middlewares: [authenticateToken]
    },
    {
        path: "/account/auth",
        router: authRouter,
    },
    {
        path: "*",
        router: (req: any, res: any) => {
            res.status(HttpCodes.NOT_FOUND).json({ message: "Route not found" });
        }
    }
];
