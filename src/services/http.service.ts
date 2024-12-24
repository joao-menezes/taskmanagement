import sequelize from "../config/sequelize.database.config";
import express, { Express } from 'express';
import logger from "../shared/utils/logger";
import {authenticateToken} from "../middleware/authToken.middleware";
import routes from "../routes/routes";
import authRouter from "../routes/auth.routes";
import dotenv from "dotenv";

dotenv.config();
const _fileName = module.filename.split("/").pop();

export class HttpService {
    app: Express = express();
    private port: number = +String(process.env.PORT);

    constructor() {
        this.app.use(express.json());

        this.app.use('/api', authenticateToken, routes);
        this.app.use('/account/auth', authRouter);
    }

    async _initializeDatabase() {
        try {
            await sequelize.authenticate();
            logger.info('Database connected successfully.');
        } catch (error) {
            logger.error(`Database connection failed: ${error} - ${_fileName}`);
            process.exit(1);
        }
    }

    _startServer() {
        let server = this.app.listen(this.port, () => {
            logger.info(`Server is running on http://localhost:${this.port} - ${_fileName}`);
        });

        server.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                logger.warn(`Port ${this.port} is in use. Trying port ${this.port + 1}...`);
                this.port++;
                this._startServer();
            } else {
                logger.error(`Server error: ${error} - ${_fileName}`);
                process.exit(1);
            }
        });
    }

    async start() {
        if (process.env.NODE_ENV !== 'production') {
            await this._initializeDatabase();
        }
        this._startServer();
    }
}
