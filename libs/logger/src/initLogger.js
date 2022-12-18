import winston from 'winston';
import * as path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { SplunkHTTPTransport } from './winstonTransportForSplunk';
import 'winston-daily-rotate-file';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'DD.MM.YYYY HH:mm:ss' }),
    winston.format.json(),
  ),
});

/**
 * @param {object} config - Configuration Settings
 * @param {string[]} [config.logTo=['console']]
 * @param {string} config.logDir - Directory to store log files
 * @param {object} config.splunk - the Splunk Logger settings
 * @param {string} config.splunk.token - the Splunk HTTP Event Collector token
 * @param {string} [config.splunk.index=winston-index] - the index that events will go to in Splunk
 * @param {string} [config.splunk.source=winston] - the source for the events sent to Splunk
 * @param {string} [config.splunk.sourcetype=winston-splunk-logger] - the sourcetype for the events sent to Splunk
 * @param {string} [config.splunk.host=localhost] - the Splunk HTTP Event Collector host
 * @param {number} [config.splunk.maxRetries=0] - How many times to retry the splunk logger
 * @param {number} [config.splunk.port=8088] - the Splunk HTTP Event Collector port
 * @param {string} [config.splunk.path=/services/collector/event/1.0] - URL path to use
 * @param {string} [config.splunk.protocol=https] - the protocol to use
 * @param {string} [config.splunk.url] - URL string to pass to url.parse for the information
 * @param {function} [config.splunk.eventFormatter] - Formats events, returning an event as a string, <code>function(message, severity)</code>
 */
export function initLogger(config) {
  if (config?.logTo && Array.isArray(config?.logTo) === false) {
    throw new Error(
      `${chalk.bold(
        'config.logTo',
      )} must be array of strings. e.g ['console', 'file', 'splunk']`,
    );
  } else if (
    config?.logTo.every(
      el => typeof el === 'string' || el instanceof String,
    ) === false
  ) {
    throw new Error(`Invalid ${chalk.bold('config.logTo')} options`);
  }

  const logTo = config?.logTo ?? ['console'];
  let logDir = config?.logDir;
  const splunk = config?.splunk;

  // if logTo is set to file, LogDir needs to be provided
  if (logTo.includes('file')) {
    if (
      logDir &&
      (typeof logDir === 'string' || logDir instanceof String) &&
      logDir.length > 0
    ) {
      // if directory is provided, check for write privileges
      logDir = logDir.endsWith('/') ? logDir : `${logDir}/`;
      try {
        fs.accessSync(logDir, fs.constants.W_OK);
      } catch (err) {
        throw new Error(`${chalk.bold(logDir)} is not writeable`);
      }
    } else {
      throw new Error(
        `${chalk.bold('logDir')} is required for ${chalk.bold(
          'logTo=["file"]',
        )}`,
      );
    }
  }

  if (logTo.includes('splunk') && !splunk) {
    throw new Error(
      `${chalk.bold(
        'splunk configuration options',
      )} are required for logging to splunk`,
    );
  }

  // CONFIG LOOKS FINE..

  if (logTo.includes('console')) {
    logger.add(
      new winston.transports.Console({
        level: 'debug',
      }),
    );
  }

  if (logTo.includes('file')) {
    logger.add(
      new winston.transports.DailyRotateFile({
        filename: path.join(logDir, 'debug-%DATE%.log'),
        level: 'debug',
        datePattern: 'YYYY-MM-DD',
      }),
    );

    logger.add(
      new winston.transports.DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        level: 'error',
        datePattern: 'YYYY-MM-DD',
      }),
    );

    logger.add(
      new winston.transports.DailyRotateFile({
        filename: path.join(logDir, 'info-%DATE%.log'),
        level: 'info',
        datePattern: 'YYYY-MM-DD',
      }),
    );
  }

  if (logTo.includes('splunk')) {
    logger.add(new SplunkHTTPTransport({ splunk }));
  }
}
