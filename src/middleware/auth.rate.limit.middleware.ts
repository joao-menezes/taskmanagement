import rateLimit from "express-rate-limit";
import HttpCodes from 'http-status-codes';
import {ConnectionRetry} from "../shared/utils/enums/connections.retry";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: ConnectionRetry.maxRetries,
    message: { error: 'Too many attempts, try again later.' },
    statusCode: HttpCodes.TOO_MANY_REQUESTS,
});