import { Cache } from './memCache';

describe('In Memory Cache', () => {
  const { jest } = import.meta;

  describe('put()', () => {
    jest.useFakeTimers();

    it('should allow adding new item to cache', () => {
      const cache = new Cache();
      expect(() => {
        cache.put('foo', 'bar');
      }).not.toThrow();
    });

    it('should allow adding new item to cache with a timeout', () => {
      const cache = new Cache();
      expect(() => {
        cache.put('foo', 'bar', 100);
      }).not.toThrow();
    });

    it('should throw when timeout value is a string', () => {
      const cache = new Cache();
      expect(() => {
        cache.put('foo', 'bar', '100');
      }).toThrow();
    });

    it('should throw when timeout value is NaN', () => {
      const cache = new Cache();
      expect(() => {
        cache.put('foo', 'bar', NaN);
      }).toThrow();
    });

    it('should throw when timeout value is 0', () => {
      const cache = new Cache();
      expect(() => {
        cache.put('foo', 'bar', 0);
      }).toThrow();
    });

    it('should throw when timeout value is negative', () => {
      const cache = new Cache();
      expect(() => {
        cache.put('foo', 'bar', -100);
      }).toThrow();
    });

    it('should not throw when timeout value is undefined', () => {
      const cache = new Cache();
      expect(() => {
        cache.put('foo', 'bar', undefined);
      }).not.toThrow();
    });

    it('should not throw when timeout value is null', () => {
      const cache = new Cache();
      expect(() => {
        cache.put('foo', 'bar', null);
      }).not.toThrow();
    });

    it('should allow adding new item to cache with a timeout and a timeout callback', () => {
      const cache = new Cache();
      expect(() => {
        cache.put('foo', 'bar', 100, () => {
          //
        });
      }).not.toThrow();
    });

    it('should throw when callback is not a function', () => {
      const cache = new Cache();
      expect(() => {
        cache.put('foo', 'bar', 100, 'not-function');
      }).toThrow();
    });

    it('should call the timeout-callback when time if up', () => {
      const cache = new Cache();
      const cb = jest.fn();
      cache.put('foo', 'bar', 100, cb);
      jest.advanceTimersByTime(98);
      expect(cb).not.toHaveBeenCalled();
      jest.runAllTimers();
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith('foo', 'bar');
    });

    it('should override the timeout-callback on new put() with a new callback before the time is up, with the same key', () => {
      const cache = new Cache();
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      cache.put('foo', 'bar', 100, cb1);
      jest.advanceTimersByTime(98);
      cache.put('foo', 'bar 2', 100, cb2);
      jest.runAllTimers();
      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledWith('foo', 'bar 2');
    });

    it('should cancel the timeout-callback on new put() call without a callback before the time is up, with the same key', () => {
      const cache = new Cache();
      const cb = jest.fn();
      cache.put('foo', 'bar', 100, cb);
      jest.advanceTimersByTime(98);
      cache.put('foo', 'new bar');
      jest.runAllTimers();
      expect(cb).not.toHaveBeenCalled();
    });

    it('should return the cached value', () => {
      const cache = new Cache();
      expect(cache.put('foo', 'bar')).toBe('bar');
    });

    it('should increment the cache size by 1 on addition of a key', () => {
      const cache = new Cache();
      expect(cache.size).toBe(0);
      cache.put('key1', 'value1');
      expect(cache.size).toBe(1);
      cache.put('key2', 'value2');
      expect(cache.size).toBe(2);
      cache.put('key2', 'value2');
      expect(cache.size).toBe(2);
    });
  });

  describe('del()', () => {
    it('should return false when trying to delete something on empty cache', () => {
      const cache = new Cache();
      expect(cache.del('ghost')).toBe(false);
    });

    it('should return false when trying to delete non-existing key', () => {
      const cache = new Cache();
      cache.put('foo', 'bar');
      expect(cache.del('ghost')).toBe(false);
    });

    it('should return true on successful deletion of a key from cache', () => {
      const cache = new Cache();
      cache.put('foo', 'bar');
      expect(cache.get('foo')).toBe('bar');
      expect(cache.del('foo')).toBe(true);
      expect(cache.get('foo')).toBeNull();
    });

    it('should decrement the cache size by 1 on successful deletion of a key from cache', () => {
      const cache = new Cache();
      cache.put('foo', 'bar');
      const prevSize = cache.size;
      expect(cache.del('foo')).toBe(true);
      expect(cache.size).toBe(prevSize - 1);
    });

    it('should not delete other keys from the cache', () => {
      const cache = new Cache();
      cache.put('key1', 'val1');
      cache.put('key2', 'val2');
      cache.put('key3', 'val3');
      expect(cache.get('key1')).toBe('val1');
      expect(cache.get('key2')).toBe('val2');
      expect(cache.get('key3')).toBe('val3');
      cache.del('key1');
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('val2');
      expect(cache.get('key3')).toBe('val3');
    });

    it('should delete only once and track cache size correctly even if del() is called multiple times on the same key', () => {
      const cache = new Cache();
      cache.put('key1', 'val1');
      cache.put('key2', 'val2');
      cache.put('key3', 'val3');
      expect(cache.size).toBe(3);
      cache.del('key1');
      cache.del('key1');
      cache.del('key1');
      expect(cache.size).toBe(2);
    });

    it('should allow to re-add values to cache, after deleting them', () => {
      const cache = new Cache();
      cache.put('key', 'val');
      expect(cache.get('key')).toBe('val');
      cache.del('key');
      expect(cache.get('key')).toBeNull();
      cache.put('key', 'val');
      expect(cache.get('key')).toBe('val');
      cache.del('key');
      expect(cache.get('key')).toBeNull();
    });

    it('should be able to delete non-expired key', () => {
      const cache = new Cache();
      cache.put('key', 'val', 100);
      jest.advanceTimersByTime(98);
      expect(cache.del('key')).toBe(true);
    });

    it('should not be possible to delete expired key', () => {
      const cache = new Cache();
      cache.put('key', 'val', 100);
      expect(cache.size).toBe(1);
      jest.advanceTimersByTime(100);
      expect(cache.del('key')).toBe(false);
      expect(cache.get('key')).toBeNull();
      expect(cache.size).toBe(0);
    });

    it('should cancel the timeout-callback for deleted key', () => {
      const cache = new Cache();
      const cb = jest.fn();
      cache.put('key', 'val', 100, cb);
      cache.del('key');
      jest.advanceTimersByTime(100);
      expect(cb).not.toHaveBeenCalled();
    });

    it('should be able to handle deletion of many items', done => {
      const cache = new Cache();
      const num = 1000;
      for (let i = 0; i < num; i += 1) {
        cache.put(`key ${i}`, `${i} key`, 1000);
      }
      expect(cache.size).toBe(num);
      setTimeout(() => {
        expect(cache.size).toBe(0);
        done();
      }, 1000);
      jest.advanceTimersByTime(1000);
    });
  });

  describe('clear()', () => {
    it('should have no effect on empty cache', () => {
      const cache = new Cache();
      expect(cache.size).toBe(0);
      cache.clear();
      expect(cache.size).toBe(0);
    });

    it('should remove all keys from the cache', () => {
      const cache = new Cache();
      cache.put('key1', 'val1');
      cache.put('key2', 'val2');
      cache.put('key3', 'val3');
      expect(cache.size).toBe(3);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });

    it('should reset debug hitCounts', () => {
      const cache = new Cache();
      cache.debug(true);
      cache.put('key', 'val1');
      cache.get('key');
      expect(cache.hits).toBe(1);
      cache.get('key');
      expect(cache.hits).toBe(2);
      cache.clear();
      expect(cache.hits).toBe(0);
    });

    it('should reset debug missCounts', () => {
      const cache = new Cache();
      cache.debug(true);
      cache.get('key');
      expect(cache.misses).toBe(1);
      cache.get('key');
      expect(cache.misses).toBe(2);
      cache.clear();
      expect(cache.misses).toBe(0);
    });

    it('should cancel the timeout-callbacks for all existing keys', () => {
      const cache = new Cache();
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      const cb3 = jest.fn();
      cache.put('key1', 'val1', 100, cb1);
      cache.put('key2', 'val2', 100, cb2);
      cache.put('key3', 'val3', 100, cb3);
      cache.clear();
      jest.advanceTimersByTime(100);
      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).not.toHaveBeenCalled();
      expect(cb3).not.toHaveBeenCalled();
    });
  });

  describe('get()', () => {
    it('should return null given a key for an empty cache', () => {
      const cache = new Cache();
      expect(cache.get('miss')).toBeNull();
    });

    it('should return null given a key not in a non-empty cache', () => {
      const cache = new Cache();
      cache.put('key', 'value');
      expect(cache.get('miss')).toBeNull();
    });

    it('should return the corresponding value of a key in the cache', () => {
      const cache = new Cache();
      cache.put('key', 'value');
      expect(cache.get('key')).toBe('value');
    });

    it('should return the latest corresponding value of a key in the cache', () => {
      const cache = new Cache();
      cache.put('key', 'value1');
      cache.put('key', 'value2');
      cache.put('key', 'value3');
      expect(cache.get('key')).toBe('value3');
    });

    it('should handle various types of cache keys', () => {
      const cache = new Cache();
      const keys = [
        null,
        undefined,
        NaN,
        true,
        false,
        0,
        1,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        '',
        'a',
        [],
        {},
        [1, 'a', false],
        { a: 1, b: 'a', c: false },
        function key() {
          //
        },
        () => {
          //
        },
      ];
      keys.forEach((key, index) => {
        const value = `value${index}`;
        cache.put(key, value);
        expect(cache.get(key)).toEqual(value);
      });
    });

    it('should handle various types of cache values', () => {
      const cache = new Cache();
      const values = [
        null,
        undefined,
        NaN,
        true,
        false,
        0,
        1,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        '',
        'a',
        [],
        {},
        [1, 'a', false],
        { a: 1, b: 'a', c: false },
        function val() {
          //
        },
        () => {
          //
        },
      ];
      values.forEach((value, index) => {
        const key = `key${index}`;
        cache.put(key, value);
        expect(cache.get(key)).toEqual(value);
      });
    });

    it('should not set a timeout given no expiration time', () => {
      const cache = new Cache();
      cache.put('key', 'value');
      jest.advanceTimersByTime(10000);
      expect(cache.get('key')).toBe('value');
    });

    it('should return the corresponding value of a non-expired key in the cache', () => {
      const cache = new Cache();
      cache.put('key', 'value', 100);
      jest.advanceTimersByTime(99);
      expect(cache.get('key')).toBe('value');
    });

    it('should return null given an expired key', () => {
      const cache = new Cache();
      cache.put('key', 'value', 100);
      jest.advanceTimersByTime(100);
      expect(cache.get('key')).toBeNull();
    });

    it('should return null given a key which is a property on the Object prototype', () => {
      const cache = new Cache();
      expect(cache.get('toString')).toBeNull();
    });

    it('should allow reading the value for a key which is a property on the Object prototype', () => {
      const cache = new Cache();
      cache.put('toString', 'value');
      expect(cache.get('toString')).toBe('value');
    });
  });

  describe('size()', () => {
    it('should return 0 given a fresh cache', () => {
      const cache = new Cache();
      expect(cache.size).toBe(0);
    });

    it('should return 1 after adding a single item to the cache', () => {
      const cache = new Cache();
      cache.put('key', 'value');
      expect(cache.size).toBe(1);
    });

    it('should return 3 after adding three items to the cache', () => {
      const cache = new Cache();
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      expect(cache.size).toBe(3);
    });

    it('should not multi-count duplicate items added to the cache', () => {
      const cache = new Cache();
      cache.put('key', 'value1');
      expect(cache.size).toBe(1);
      cache.put('key', 'value2');
      expect(cache.size).toBe(1);
    });

    it('should update when a key in the cache expires', () => {
      const cache = new Cache();
      cache.put('key', 'value', 1000);
      expect(cache.size).toBe(1);
      jest.advanceTimersByTime(999);
      expect(cache.size).toBe(1);
      jest.advanceTimersByTime(1);
      expect(cache.size).toBe(0);
    });
  });

  describe('memSize()', () => {
    it('should return 0 given a fresh cache', () => {
      const cache = new Cache();
      expect(cache.memSize()).toBe(0);
    });

    it('should return 1 after adding a single item to the cache', () => {
      const cache = new Cache();
      cache.put('key', 'value');
      expect(cache.memSize()).toBe(1);
    });

    it('should return 3 after adding three items to the cache', () => {
      const cache = new Cache();
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      expect(cache.memSize()).toBe(3);
    });

    it('should not multi-count duplicate items added to the cache', () => {
      const cache = new Cache();
      cache.put('key', 'value1');
      expect(cache.memSize()).toBe(1);
      cache.put('key', 'value2');
      expect(cache.memSize()).toBe(1);
    });

    it('should update when a key in the cache expires', () => {
      const cache = new Cache();
      cache.put('key', 'value', 1000);
      expect(cache.memSize()).toBe(1);
      jest.advanceTimersByTime(999);
      expect(cache.memSize()).toBe(1);
      jest.advanceTimersByTime(1);
      expect(cache.memSize()).toBe(0);
    });
  });

  describe('debug()', () => {
    it('should not count cache hits when false', () => {
      const cache = new Cache();
      cache.debug(false);
      cache.put('key', 'value');
      cache.get('key');
      expect(cache.hits).toBe(0);
    });

    it('should not count cache misses when false', () => {
      const cache = new Cache();
      cache.debug(false);
      cache.put('key', 'value');
      cache.get('miss1');
      expect(cache.misses).toBe(0);
    });

    it('should count cache hits when true', () => {
      const cache = new Cache();
      cache.debug(true);
      cache.put('key', 'value');
      cache.get('key');
      expect(cache.hits).toBe(1);
    });

    it('should count cache misses when true', () => {
      const cache = new Cache();
      cache.debug(true);
      cache.put('key', 'value');
      cache.get('miss1');
      expect(cache.misses).toBe(1);
      cache.put('key1', 'val1', 100);
      jest.advanceTimersByTime(100);
      cache.get('key1');
      expect(cache.misses).toBe(2);
      expect(cache.size).toBe(1);
    });
  });

  describe('debug feat. hits', () => {
    it('should return 0 given an empty cache', () => {
      const cache = new Cache({ debug: true });
      expect(cache.hits).toBe(0);
    });

    it('should return 0 given a non-empty cache which has not been accessed', () => {
      const cache = new Cache({ debug: true });
      cache.put('key', 'value');
      expect(cache.hits).toBe(0);
    });

    it('should return 0 given a non-empty cache which has had only misses', () => {
      const cache = new Cache({ debug: true });
      cache.put('key', 'value');
      cache.get('miss1');
      cache.get('miss2');
      cache.get('miss3');
      expect(cache.hits).toBe(0);
    });

    it('should return 1 given a non-empty cache which has had a single hit', () => {
      const cache = new Cache({ debug: true });
      cache.put('key', 'value');
      cache.get('key');
      expect(cache.hits).toBe(1);
    });

    it('should return 3 given a non-empty cache which has had three hits on the same key', () => {
      const cache = new Cache({ debug: true });
      cache.put('key', 'value');
      cache.get('key');
      cache.get('key');
      cache.get('key');
      expect(cache.hits).toBe(3);
    });

    it('should return 3 given a non-empty cache which has had three hits across many keys', () => {
      const cache = new Cache({ debug: true });
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      cache.get('key1');
      cache.get('key2');
      cache.get('key3');
      expect(cache.hits).toBe(3);
    });

    it('should return the correct value after a sequence of hits and misses', () => {
      const cache = new Cache({ debug: true });
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      cache.get('key1');
      cache.get('miss');
      cache.get('key3');
      expect(cache.hits).toBe(2);
    });

    it('should not count hits for expired keys', () => {
      const cache = new Cache({ debug: true });
      cache.put('key', 'value', 1000);
      cache.get('key');
      expect(cache.hits).toBe(1);
      jest.advanceTimersByTime(999);
      cache.get('key');
      expect(cache.hits).toBe(2);
      jest.advanceTimersByTime(1);
      cache.get('key');
      expect(cache.hits).toBe(2);
    });
  });

  describe('debug feat. misses', () => {
    it('should return 0 given an empty cache', () => {
      const cache = new Cache({ debug: true });
      expect(cache.misses).toBe(0);
    });

    it('should return 0 given a non-empty cache which has not been accessed', () => {
      const cache = new Cache({ debug: true });
      cache.put('key', 'value');
      expect(cache.misses).toBe(0);
    });

    it('should return 0 given a non-empty cache which has had only hits', () => {
      const cache = new Cache({ debug: true });
      cache.put('key', 'value');
      cache.get('key');
      cache.get('key');
      cache.get('key');
      expect(cache.misses).toBe(0);
    });

    it('should return 1 given a non-empty cache which has had a single miss', () => {
      const cache = new Cache({ debug: true });
      cache.put('key', 'value');
      cache.get('miss');
      expect(cache.misses).toBe(1);
    });

    it('should return 3 given a non-empty cache which has had three misses', () => {
      const cache = new Cache({ debug: true });
      cache.put('key', 'value');
      cache.get('miss1');
      cache.get('miss2');
      cache.get('miss3');
      expect(cache.misses).toBe(3);
    });

    it('should return the correct value after a sequence of hits and misses', () => {
      const cache = new Cache({ debug: true });
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      cache.get('key1');
      cache.get('miss');
      cache.get('key3');
      expect(cache.misses).toBe(1);
    });

    it('should count misses for expired keys', () => {
      const cache = new Cache({ debug: true });
      cache.put('key', 'value', 1000);
      cache.get('key');
      expect(cache.misses).toBe(0);
      jest.advanceTimersByTime(999);
      cache.get('key');
      expect(cache.misses).toBe(0);
      jest.advanceTimersByTime(1);
      cache.get('key');
      expect(cache.misses).toBe(1);
    });
  });

  describe('keys()', () => {
    it('should return an empty array given an empty cache', () => {
      const cache = new Cache();
      expect(cache.keys()).toEqual([]);
    });

    it('should return a single key after adding a single item to the cache', () => {
      const cache = new Cache();
      cache.put('key', 'value');
      expect(cache.keys()).toEqual(['key']);
    });

    it('should return 3 keys after adding three items to the cache', () => {
      const cache = new Cache();
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      expect(cache.keys()).toEqual(['key1', 'key2', 'key3']);
    });

    it('should not multi-count duplicate items added to the cache', () => {
      const cache = new Cache();
      cache.put('key', 'value1');
      expect(cache.keys()).toEqual(['key']);
      cache.put('key', 'value2');
      expect(cache.keys()).toEqual(['key']);
    });

    it('should update when a key in the cache expires', () => {
      const cache = new Cache();
      cache.put('key', 'value', 1000);
      expect(cache.keys()).toEqual(['key']);
      jest.advanceTimersByTime(999);
      expect(cache.keys()).toEqual(['key']);
      jest.advanceTimersByTime(1);
      expect(cache.keys()).toEqual([]);
    });
  });

  describe('toJSON()', () => {
    const START_TIME = Date.now();
    Date.now = jest.fn(() => START_TIME);
    const BASIC_EXPORT = timeout =>
      JSON.stringify({
        key: {
          value: 'value',
          expire: START_TIME + timeout,
        },
      });

    it('should return an empty object given an empty cache', () => {
      const cache = new Cache();
      expect(cache.toJSON()).toBe(JSON.stringify({}));
    });

    it('should return a single record after adding a single item to the cache', () => {
      const cache = new Cache();

      cache.put('key', 'value', 1000);
      expect(cache.toJSON()).toBe(BASIC_EXPORT(1000));
    });

    it('should return multiple records with expiry', () => {
      const cache = new Cache();
      cache.put('key1', 'value1');
      cache.put('key2', 'value2', 1000);
      expect(cache.toJSON()).toBe(
        JSON.stringify({
          key1: {
            value: 'value1',
            expire: 'NaN',
          },
          key2: {
            value: 'value2',
            expire: START_TIME + 1000,
          },
        }),
      );
    });

    it('should update when a key in the cache expires', () => {
      const cache = new Cache();
      cache.put('key', 'value', 1000);
      expect(cache.toJSON()).toBe(BASIC_EXPORT(1000));
      jest.advanceTimersByTime(999);
      expect(cache.toJSON()).toBe(BASIC_EXPORT(1000));
      jest.advanceTimersByTime(1);
      expect(cache.toJSON()).toBe(JSON.stringify({}));
    });
  });

  describe('fromJSON()', () => {
    const START_TIME = Date.now();
    Date.now = jest.fn(() => START_TIME);

    it('should import an empty object into an empty cache', () => {
      const cache = new Cache();
      const exportedJson = cache.toJSON();
      cache.clear();
      cache.fromJSON(exportedJson);
      expect(cache.toJSON()).toBe(JSON.stringify({}));
    });

    it('should import records into an empty cache', () => {
      const cache = new Cache();
      cache.put('key1', 'value1');
      cache.put('key2', 'value2', 1000);
      const exportedJson = cache.toJSON();
      cache.clear();
      cache.fromJSON(exportedJson);
      expect(cache.toJSON()).toBe(
        JSON.stringify({
          key1: {
            value: 'value1',
            expire: 'NaN',
          },
          key2: {
            value: 'value2',
            expire: START_TIME + 1000,
          },
        }),
      );
    });

    it('should import records and filter out the expired ones', () => {
      const cache = new Cache();
      const jsonToImport = JSON.stringify({
        valid: {
          value: 'val1',
          expire: START_TIME + 1000,
        },
        expired: {
          value: 'expired value',
          expire: START_TIME - 1000,
        },
      });
      cache.fromJSON(jsonToImport);
      expect(cache.toJSON()).toBe(
        JSON.stringify({
          valid: {
            value: 'val1',
            expire: START_TIME + 1000,
          },
        }),
      );
    });

    it('should import records into an already-existing cache', () => {
      const cache = new Cache();
      cache.put('key1', 'value1');
      cache.put('key2', 'value2', 1000);
      const exportedJson = cache.toJSON();
      cache.put('key1', 'changed value', 5000);
      cache.put('key3', 'value3', 500);
      cache.fromJSON(exportedJson);
      expect(cache.toJSON()).toBe(
        JSON.stringify({
          key1: {
            value: 'value1',
            expire: 'NaN',
          },
          key2: {
            value: 'value2',
            expire: START_TIME + 1000,
          },
          key3: {
            value: 'value3',
            expire: START_TIME + 500,
          },
        }),
      );
    });

    it('should import records into an already-existing cache and skip duplicates', () => {
      const cache = new Cache();
      cache.debug(true);
      cache.put('key1', 'value1');
      cache.put('key2', 'value2', 1000);
      const exportedJson = cache.toJSON();
      cache.clear();
      cache.put('key1', 'changed value', 5000);
      cache.put('key3', 'value3', 500);
      cache.fromJSON(exportedJson, { skipDuplicates: true });
      expect(cache.toJSON()).toBe(
        JSON.stringify({
          key1: {
            value: 'changed value',
            expire: START_TIME + 5000,
          },
          key3: {
            value: 'value3',
            expire: START_TIME + 500,
          },
          key2: {
            value: 'value2',
            expire: START_TIME + 1000,
          },
        }),
      );
    });

    it('should return the new size', () => {
      const cache = new Cache();
      cache.put('key1', 'value1', 500);
      const exportedJson = cache.toJSON();
      cache.clear();
      cache.put('key2', 'value2', 1000);
      expect(cache.size).toBe(1);
      const size = cache.fromJSON(exportedJson);
      expect(size).toBe(2);
      expect(cache.size).toBe(2);
    });
  });

  describe('new Cache()', () => {
    it('should return a new cache instance when called', () => {
      const cache1 = new Cache();
      const cache2 = new Cache();
      cache1.put('key', 'value1');
      expect(cache1.keys()).toStrictEqual(['key']);
      expect(cache2.keys()).toStrictEqual([]);
      cache2.put('key', 'value2');
      expect(cache1.get('key')).toBe('value1');
      expect(cache2.get('key')).toBe('value2');
    });

    it('should enable debug options correctly', () => {
      const cache = new Cache({ debug: true });
      cache.get('hello');
      expect(cache.misses).toBe(1);
    });

    it('should throw when provided logger is invalid', () => {
      expect(() => new Cache({ logger: {} })).toThrow();
    });

    it('should set proved logger correctly', () => {
      const logger = {
        log: jest.fn(),
      };
      let cache;
      expect(() => {
        cache = new Cache({ debug: true, logger });
      }).not.toThrow();
      cache.put('key', 'val');
      expect(logger.log).toHaveBeenCalledTimes(2);
    });
  });
});
