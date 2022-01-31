const winston = require('winston');

export const Logger = winston.createLogger({
  format: winston.format.simple(),
  level: process.env.LOGGER_LEVEL || 'debug',
  transports: [new winston.transports.Console()],
});
