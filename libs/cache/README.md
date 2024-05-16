# @surjit/cache

A tiny yet elegant in-memory-cache implementation in javascript.

Install: `npm i @surjit/cache`

## API

### Get Started

```js
import Cache from '@surjit/cache';

const cache = new Cache();

// store in cache
cache.put('foo', 'bar'); // returns "bar"
// set cache validity in milliseconds
cache.put('foo', 'bar', 5000); // returns "bar"

// get cached data
cache.get('foo'); // returns "bar"

// delete cached data
cache.del('foo'); // returns true
```

### cache.put(key: any, value: any | unknown, timeout: number, onTimeoutCallback: (key: string, value: any) => any): any

Returns the cached data.

| Param             | Data Type                          | Description                                                            | Required |
| ----------------- | ---------------------------------- | ---------------------------------------------------------------------- | -------- |
| key               | `any`                              | Cache key                                                              | YES      |
| value             | `any \| unknown`                   | Data to be cached                                                      | YES      |
| timeout           | `number \| undefined`              | Cache validity in milliseconds. Leave undefined for infinite validity. | NO       |
| onTimeoutCallback | `(key: string, value: any) => any` | Function to be called when the cache expires                           | NO       |

> `cache_key` can be of any data-type. Make sure to pass the correct reference to the key for fetching the cached data if you're using a referenced data-type for cache_keys.

Some examples of supported keys:

- `null`
- `undefined`
- `NaN`
- `true`
- `false`
- `0`
- `1`
- `Number.POSITIVE_INFINITY`
- `Number.NEGATIVE_INFINITY`
- `''`
- `'a'`
- `[]`
- `{}`
- `[1, 'a', false]`
- `{ a: 1, b: 'a', c: false }`
- `function key() {}`
- `() => {}`

```js
cache.put(null, 'value-x'); // valid ✅
cache.put(undefined, 'value-x'); // valid ✅
cache.put(NaN, 'value-x'); // valid ✅
cache.put(true, 'value-x'); // valid ✅
cache.put(false, 'value-x'); // valid ✅
cache.put(0, 'value-x'); // valid ✅
cache.put(1, 'value-x'); // valid ✅
cache.put(Number.POSITIVE_INFINITY, 'value-x'); // valid ✅
cache.put(Number.NEGATIVE_INFINITY, 'value-x'); // valid ✅
cache.put('', 'value-x'); // valid ✅
cache.put('a', 'value-x'); // valid ✅
cache.put([], 'value-x'); // valid ✅
cache.put({}, 'value-x'); // valid ✅
cache.put([1, 'a', false], 'value-x'); // valid ✅
cache.put({ a: 1, b: 'a', c: false }, 'value-x'); // valid ✅
cache.put(function key() {}, 'value-x'); // valid ✅
cache.put(() => {}, 'value-x'); // valid ✅
```

### cache.get(key: any): any | null

Returns cached data or null if not-found or expired.

| Param | Data Type | Description | Required |
| ----- | --------- | ----------- | -------- |
| key   | `string`  | Cache key   | YES      |

### cache.del(key: any): boolean

Returns `true` on deletion success and `false` on failure.

| Param | Data Type | Description | Required |
| ----- | --------- | ----------- | -------- |
| key   | `string`  | Cache key   | YES      |

### cache.clear(): void

Clears the cache instance by deleting all cached data.

### cache.memSize(): number

Returns the count of cache entries in the instance.

### cache.keys(): string[]

Returns an array of keys of all the cached data in the instance.

### cache.toJSON(options: { prettyIndentation: number }): string

Exports all the cached data (without the expiry information) to a JSON string, optionally prettifying the json with provided indentation.

### cache.fromJSON(jsonToImport: string, options: { skipDuplicates: boolean }): number

Add bulk data to the cache.

```js
cache.fromJSON(
  JSON.stringify({
    key1: {
      value: 'value1',
      expire: 'NaN', // infinite validity
    },
    key2: {
      value: 'value2',
      expire: Date.now() + 1000,
    },
  }),
);
```

## Debug

There are some debugging features built-in to the library, such as keeping track of cache hits and misses, size of the cache, logging the cache interactions/operations.

Debugging features are turned off by default.

### Enable Debugging

```js
import Cache from '@surjit/cache';

const cacheV1 = new Cache({ debug: true });
// or
const cacheV2 = new Cache();
cacheV2.debug(true);
```

Once debugging is enabled, we get access to the following features

```js
console.log(cache.hits); // count cache hits
console.log(cache.misses); // count of cache misses
```

### Logging

By default javascript console is used as logger, and logs cache operations when debug mode is enabled.

```js
const cacheV1 = new Cache({ debug: true, logger: CustomLogger });
// or
const cacheV2 = new Cache();
cacheV2.debug(true);
cacheV2.setLogger(CustomLogger);
```
