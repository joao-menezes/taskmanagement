import sequelize from "../config/sequelize.database.config";
import express, { Express } from 'express';
import logger from "../shared/utils/logger";
import {authenticateToken} from "../middleware/authToken.middleware";
import routes from "../routes/routes";
import authRouter from "../routes/auth.routes";
import dotenv from "dotenv";
import {setupAssociations} from "../model/associations";

dotenv.config();
const _fileName = module.filename.split("/").pop();

export class HttpService {
    app: Express = express();
    private port: number = +String(process.env.PORT);
    private retryCount: number = 0;
    private maxRetries: number = 5;
    private retryDelay: number = 5000;

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
            throw error;
        }
    }

    private _startHttpServer(): void {
        setupAssociations();
        const server = this.app.listen(this.port, () => {
            logger.info(`Server is running on http://localhost:${this.port} - ${_fileName}`);
        });

        server.on("error", (error: any) => {
            if (error.code !== "EADDRINUSE") {
                logger.error(`Server error: ${error} - ${_fileName}`);
                process.exit(1);
            }
            logger.warn(`Port ${this.port} is in use. Trying port ${this.port + 1}...`);
            this.port++;
            this._startHttpServer();
        });
    }

    async _startServer(): Promise<void> {
        try {
            await this._initializeDatabase();
            this._startHttpServer();
        } catch (error) {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                logger.warn(
                    `Retrying to connect to the database (${this.retryCount}/${this.maxRetries}) in ${
                        this.retryDelay / 1000
                    } seconds...`
                );
                setTimeout(() => this._startServer(), this.retryDelay);
            } else {
                logger.error("Max retries reached. Could not connect to the database.");
                process.exit(1);
            }
        }
    }

    async start(): Promise<void> {
        if (process.env.NODE_ENV !== "production") {
            await this._startServer();
        } else {
            this._startHttpServer();
        }
    }
}
