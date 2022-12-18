import winston from 'winston';
import * as Splunk from 'splunk-logging';

/**
 * A class that implements a Winston transport provider for Splunk HTTP Event Collector
 *
 * @constructor
 */
export class SplunkHTTPTransport extends winston.Transport {
  /**
   * @param {object} config - Configuration settings for a new Winston transport
   * @param {string} [config.level=info] - the minimum level to log
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
   * @param {string} [config.level=info] - Logging level to use, will show up as the <code>severity</code> field of an log event
   * @param {number} [config.batchInterval=0] - Automatically flush events after this many milliseconds.
   * When set to a non-positive value, events will be sent one by one. This setting is ignored when non-positive.
   * @param {number} [config.maxBatchSize=0] - Automatically flush events after the size of queued events exceeds this many bytes.
   * This setting is ignored when non-positive.
   * @param {number} [config.maxBatchCount=1] - Automatically flush events after this many events have been queued.
   * Defaults to flush immediately on sending an event. This setting is ignored when non-positive.
   * @param {boolean} [config.exitOnError=true] - whether an unexpected request error causes the javascript process to exit.
   */
  constructor(config) {
    super(config);

    /** @property {string} name - the name of the transport */
    this.name = 'SplunkHTTPTransport';

    /** @property {string} level - the minimum level to log */
    this.level = config.level || 'info';
    this.exitOnError =
      typeof config.exitOnError !== 'boolean' || config.exitOnError;

    // Verify that we actually have a splunk object and a token
    if (!config.splunk || !config.splunk.token) {
      throw new Error('Invalid Configuration: options.splunk is invalid');
    }

    // If source/sourcetype are mentioned in the splunk object, then store the
    // defaults in this and delete from the splunk object
    this.defaultMetadata = {
      source: 'winston',
      sourcetype: 'winston-splunk-logger',
      index: 'winston-index',
    };
    if (config.splunk.source) {
      this.defaultMetadata.source = config.splunk.source;
    }
    if (config.splunk.sourcetype) {
      this.defaultMetadata.sourcetype = config.splunk.sourcetype;
    }
    if (config.splunk.index) {
      this.defaultMetadata.index = config.splunk.index;
    }

    // This gets around a problem with setting maxBatchCount
    // config.splunk.maxBatchCount = 1;

    /**
     * @type {Splunk.Logger}
     */
    this.server = new Splunk.Logger(config.splunk);

    // Override the default event formatter
    if (config.splunk.eventFormatter) {
      this.server.eventFormatter = config.splunk.eventFormatter;
    }
  }

  /**
   * Returns the configuration for this logger
   * @returns {Splunk.Config} Configuration for this logger.
   * @public
   */
  getConfig() {
    return this.server.config;
  }

  /**
   * Core logging method exposed to Winston.
   *
   * @function log
   * @member SplunkStreamEvent
   * @param {object} [info] - the log message info object
   * @param {function} callback - Continuation to respond to when complete
   */
  log(info, callback) {
    const self = this;
    const level = info[Symbol.for('level')];
    const splunkInfo = info.splunk || {};

    /**
     * @type {Splunk.SendContext}
     */
    const payload = {
      message: info.message,
      metadata: { ...this.defaultMetadata, ...splunkInfo },
      severity: level,
    };

    this.server.send(payload, function cb(err) {
      if (err && self.exitOnError) {
        self.emit('error', err);
      }
      self.emit('logged');
      callback(null, true);
    });
  }
}

// Insert this object into the Winston transports list
winston.transports.SplunkHTTPTransport = SplunkHTTPTransport;