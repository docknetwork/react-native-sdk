import {LOGGER_LEVEL} from '@env';
const winston = require('winston');

export const Logger = winston.createLogger({
  format: winston.format.simple(),
  level: LOGGER_LEVEL || 'info',
  transports: [new winston.transports.Console()],
});
