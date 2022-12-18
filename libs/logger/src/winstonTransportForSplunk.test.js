import { SplunkHTTPTransport } from './winstonTransportForSplunk';

describe('createLogger', () => {
  it('should error without config', () => {
    expect(() => {
      const _transport = new SplunkHTTPTransport();
    }).toThrow();
  });

  it('should error without a splunk object', () => {
    expect(() => {
      const _transport = new SplunkHTTPTransport({});
    }).toThrow();
  });

  it('should error without a splunk token', () => {
    expect(() => {
      const _transport = new SplunkHTTPTransport({ splunk: {} });
    }).toThrow();
  });

  it('should create a suitable logger with minimal config', () => {
    const transport = new SplunkHTTPTransport({ splunk: { token: 'foo' } });
    expect(transport).toBeInstanceOf(SplunkHTTPTransport);
  });

  it('should provide exitOnError as true by default', () => {
    const transport = new SplunkHTTPTransport({ splunk: { token: 'foo' } });
    expect(transport.exitOnError).toBe(true);
  });

  it('should provide exitOnError as true by default when exitOnError value is not boolean', () => {
    const transport = new SplunkHTTPTransport({
      splunk: { token: 'foo' },
      exitOnError: 'false',
    });
    expect(transport.exitOnError).toBe(true);
  });

  it('should set exitOnError correctly', () => {
    const transport = new SplunkHTTPTransport({
      splunk: { token: 'foo' },
      exitOnError: false,
    });
    expect(transport.exitOnError).toBe(false);
  });

  it('should provide a default level of info', () => {
    const t = new SplunkHTTPTransport({ splunk: { token: 'foo' } });
    expect(t.level).toBe('info');
  });

  it('should set the name property', () => {
    const t = new SplunkHTTPTransport({ splunk: { token: 'foo' } });
    expect(t.name).toBe('SplunkHTTPTransport');
  });

  it('should store the token in the splunk config', () => {
    const t = new SplunkHTTPTransport({ splunk: { token: 'foo' } });
    expect(t.getConfig().token).toBe('foo');
  });

  it('should provide a default host', () => {
    const t = new SplunkHTTPTransport({ splunk: { token: 'foo' } });
    expect(t.getConfig().host).toBe('localhost');
  });

  it('should allow an override for the default host', () => {
    const t = new SplunkHTTPTransport({
      splunk: { host: 'bar', token: 'foo' },
    });
    expect(t.getConfig().host).toBe('bar');
  });

  it('should provide a default port', () => {
    const t = new SplunkHTTPTransport({ splunk: { token: 'foo' } });
    expect(t.getConfig().port).toBe(8088);
  });

  it('should allow an override for the default host', () => {
    const t = new SplunkHTTPTransport({ splunk: { port: 2000, token: 'foo' } });
    expect(t.getConfig().port).toBe(2000);
  });

  it('should set the maxBatchCount by default', () => {
    const t = new SplunkHTTPTransport({ splunk: { token: 'foo' } });
    expect(t.getConfig().maxBatchCount).toBe(1);
  });

  it('should allow an override for the default eventFormatter', () => {
    const t = new SplunkHTTPTransport({
      splunk: { eventFormatter: 'foo', token: 'foo' },
    });
    expect(t.server.eventFormatter).toBe('foo');
  });
});

describe('Splunk Transport.log()', () => {
  let t;
  beforeEach(() => {
    t = new SplunkHTTPTransport({ splunk: { token: 'foo' } });
  });

  describe('splunk payload generation from the `info` object', () => {
    const info = {
      message: 'non-canonical message',
      level: 'non-canonical level',
      anotherKey: 'foo bar',
    };
    info[Symbol.for('level')] = 'canonical level';
    info[Symbol.for('message')] = 'canonical message';

    it('sets the `severity` to the canonical `level`', () => {
      t.server = {
        send(payload) {
          expect(payload.severity).toBe('canonical level');
        },
      };
      t.log(info);
    });

    it('sets the `message` to the non-canonical `message`', () => {
      t.server = {
        send(payload) {
          expect(payload.message).toBe(info.message);
        },
      };
      t.log(info);
    });
  });

  it('sends the payload to splunk', () => {
    let called = false;
    t.server = {
      send(_payload, _callback) {
        called = true;
      },
    };
    t.log({});
    expect(called).toBe(true);
  });

  it('calls the provided callback after payload transmission', () => {
    let called = false;
    t.server = {
      send(_payload, callback) {
        callback();
      },
    };
    t.log({}, () => {
      called = true;
    });
    expect(called).toBe(true);
  });

  it('triggers a `logged` event after payload transmission', () => {
    let called = false;
    t.on('logged', () => {
      called = true;
    });
    t.server = {
      send(_payload, callback) {
        callback();
      },
    };
    t.log({}, () => {
      // empty call back
    });
    expect(called).toBe(true);
  });

  it('triggers an `error` event if the payload transmission fails and emitOnError is true', () => {
    let called = false;
    t.on('error', () => {
      called = true;
    });
    t.server = {
      send(_payload, callback) {
        callback(new Error());
      },
    };
    t.log({}, () => {
      // empty callback
    });
    expect(called).toBe(true);
  });

  it('does not trigger an `error` event if the payload transmission fails and emitOnError is false', () => {
    t = new SplunkHTTPTransport({
      splunk: { token: 'foo' },
      exitOnError: false,
    });
    let called = false;
    t.on('error', () => {
      called = true;
    });
    t.server = {
      send(_payload, callback) {
        callback(new Error());
      },
    };
    t.log({}, () => {
      // empty callback
    });
    expect(called).toBe(false);
  });
});
