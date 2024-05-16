// const cache = {
//   key : {
//     value: {},
//     timeout: 1000,
//     expire: 'timestamp'
//   }
// }

export class Cache {
  #cache = Object.create(null); // To remove JS object's inherited properties

  #hitCount = 0;

  #missCount = 0;

  #size = 0;

  #debug = false;

  #logger = console;

  /**
   * @param {object} [config] - Optional Config options
   * @param {object} config.logger - A logger instance which must have .log method in it
   * @param {boolean} config.debug - Enable debug mode
   */
  constructor(config) {
    this.debug(!!config?.debug);
    if (config?.logger) {
      this.setLogger(config.logger);
    }
  }

  /**
   * Callback for cache timeout
   * @callback cacheTimeoutCallback
   * @param {string} key
   * @param {any} value
   */

  /**
   * Add item to the cache
   * @param {any} key
   * @param {any} value
   * @param {number=} time - in milliseconds
   * @param {cacheTimeoutCallback=} timeoutCallback
   * @returns value
   */
  put(key, value, time, timeoutCallback) {
    if (this.#debug) {
      this.#logger.log(
        `Caching: ${key}: ${JSON.stringify(value, null, 2)} ${time}`,
      );
    }

    // NaN value is falsy, so if(time) is not gonna catch it
    if (
      typeof time !== 'undefined' &&
      time !== null &&
      (typeof time !== 'number' || Number.isNaN(time) || time <= 0)
    ) {
      throw new Error('Cache timeout must be a positive number');
    } else if (timeoutCallback && typeof timeoutCallback !== 'function') {
      throw new Error('Cache timeout callback must be a function');
    }

    const oldRecord = this.#cache[key];
    if (oldRecord) {
      clearTimeout(oldRecord.timeout);
    } else {
      this.#size += 1;
    }

    const record = {
      value,
      expire: time + Date.now(),
    };

    if (!Number.isNaN(record.expire)) {
      record.timeout = setTimeout(() => {
        this.#del(key);
        if (timeoutCallback) {
          timeoutCallback(key, value);
        }
      }, time);
    }

    this.#cache[key] = record;

    if (this.#debug) {
      this.#logger.log(`Current cache size: ${this.#size}`);
    }
    return value;
  }

  /**
   *
   * @param {string} key
   */
  #del(key) {
    this.#size -= 1;
    delete this.#cache[key];
  }

  /**
   * @param {string} key
   * @returns
   */
  del(key) {
    let canDelete = true;

    const oldRecord = this.#cache[key];
    if (oldRecord) {
      clearTimeout(oldRecord.timeout);
      if (!Number.isNaN(oldRecord.expire) && oldRecord.expire < Date.now()) {
        canDelete = false;
      }
    } else {
      canDelete = false;
    }

    if (canDelete) {
      this.#del(key);
    }

    return canDelete;
  }

  clear() {
    Object.keys(this.#cache).forEach(key => {
      clearTimeout(this.#cache[key].timeout);
    });

    this.#size = 0;
    this.#cache = Object.create(null);
    if (this.#debug) {
      this.#hitCount = 0;
      this.#missCount = 0;
    }
  }

  /**
   * Get Cached data
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    const data = this.#cache[key];
    if (data) {
      if (Number.isNaN(data.expire) || data.expire >= Date.now()) {
        if (this.#debug) this.#hitCount += 1;
        return data.value;
      }
      // free some space
      if (this.#debug) this.#missCount += 1;
      this.#size -= 1;
      delete this.#cache[key];
    } else if (this.#debug) {
      this.#missCount += 1;
    }
    return null;
  }

  /**
   * Count the cache size
   */
  get size() {
    return this.#size;
  }

  /**
   * Count the cache size
   * @returns
   */
  memSize() {
    let size = 0;
    Object.keys(this.#cache).forEach(() => {
      size += 1;
    });

    return size;
  }

  /**
   * @param {boolean} bool
   */
  debug(bool) {
    this.#debug = !!bool;
  }

  get hits() {
    return this.#hitCount;
  }

  get misses() {
    return this.#missCount;
  }

  keys() {
    return Object.keys(this.#cache);
  }

  /**
   * @param {object} options
   * @param {number} options.prettyIndentation
   * @returns
   */
  toJSON(options) {
    const plainJsCache = {};

    // Discard the `timeout` property.
    // Note: JSON doesn't support `NaN`, so convert it to `'NaN'`.
    Object.keys(this.#cache).forEach(key => {
      const record = this.#cache[key];
      plainJsCache[key] = {
        value: record.value,
        expire: record.expire || 'NaN',
      };
    });

    return JSON.stringify(plainJsCache, undefined, options?.prettyIndentation);
  }

  /**
   * @param {string} jsonToImport - JSON content, not the file
   * @param {object} options
   * @param {boolean} options.skipDuplicates
   * @returns {number} size of the cache
   */
  fromJSON(jsonToImport, options) {
    const cacheToImport = JSON.parse(jsonToImport);
    const currTime = Date.now();

    const skipDuplicates = options && options.skipDuplicates;

    Object.keys(cacheToImport).forEach(key => {
      if (key in cacheToImport) {
        if (skipDuplicates) {
          const existingRecord = this.#cache[key];
          if (existingRecord) {
            if (this.#debug) {
              this.#logger.log(`Skipping duplicate imported key ${key}`);
            }
            return;
          }
        }

        const record = cacheToImport[key];

        // record.expire could be `'NaN'` if no expiry was set.
        // Try to subtract from it; a string minus a number is `NaN`, which is perfectly fine here.
        let remainingTime = record.expire - currTime;

        if (remainingTime <= 0) {
          // Delete any record that might exist with the same key, since this key is expired.
          this.del(key);
          return;
        }

        // Remaining time must now be either positive or `NaN`,
        // but `put` will throw an error if we try to give it `NaN`.
        remainingTime = remainingTime > 0 ? remainingTime : undefined;

        this.put(key, record.value, remainingTime);
      }
    });

    return this.size;
  }

  setLogger(logger) {
    if (!logger || !logger.log || typeof logger.log !== 'function') {
      throw new Error('Please provide a valid logger');
    }
    this.#logger = logger;
  }
}
