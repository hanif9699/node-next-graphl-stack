import fs from 'fs';
import { StreamOptions } from 'morgan';
import path from 'path';
import winston, { format } from 'winston';

import 'winston-daily-rotate-file';

// Use LOG_DIR from env
const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Create log directory if it does not exist
if (!fs.existsSync(path.join(__basedir,'', LOG_DIR))) {
    fs.mkdirSync(path.join(__basedir, LOG_DIR));
}

/**
 * Create a new winston logger.
 */
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: format.combine(format.colorize(), format.simple()),
            level: 'debug'
        }),
        new winston.transports.DailyRotateFile({
            format: format.combine(format.timestamp(), format.json()),
            maxFiles: '14d',
            level: LOG_LEVEL,
            dirname: LOG_DIR,
            datePattern: 'YYYY-MM-DD',
            filename: '%DATE%-debug.log'
        })
    ]
});

export const logStream: StreamOptions = {
    /**
     * A writable stream for winston logger.
     *
     * @param {any} message
     */
    write(message) {
        logger.info(message.toString());
    }
};

export default logger;
