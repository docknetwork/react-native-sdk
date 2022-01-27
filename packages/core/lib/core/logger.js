const winston = require('winston');

export const Logger = winston.createLogger({
  format: winston.format.simple(),
  level: process.env.LOGGER_LEVEL || 'info',
  transports: [new winston.transports.Console()],
});
