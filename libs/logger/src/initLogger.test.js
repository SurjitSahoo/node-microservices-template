import { initLogger } from './initLogger';
// import { __appRoot } from '../constants';

/**
 * We only need to be handle invalid configurations passed to our logger
 * Whether the logs actually getting created or not, transports are working correctly or not
 * Those stuff are already tested properly by winston library.
 */
describe('logger initialization', () => {
  it('should pass init without config', () => {
    expect(() => {
      initLogger();
    }).not.toThrow();
  });

  it('should throw when logTo is passed as string', () => {
    expect(() => {
      initLogger({ logTo: 'console' });
    }).toThrow();
  });

  it('should pass when initialized with logTo console, without any other configurations', () => {
    expect(() => {
      initLogger({ logTo: ['console'] });
    }).not.toThrow();
  });

  it('should throw when invalid logTo parameters are passed', () => {
    expect(() => {
      initLogger({ logTo: [['console']] });
    }).toThrow();
  });

  it('should throw when logTo is file and logDir is not provided', () => {
    expect(() => {
      initLogger({ logTo: ['file'] });
    }).toThrow();
  });

  it('should throw when logTo is file and logDir is not writable', () => {
    expect(() => {
      initLogger({ logTo: ['file'], logDir: '/etc/' });
    }).toThrow();
  });

  it('should throw when logTo is splunk and splunk configurations are not provided', () => {
    expect(() => {
      initLogger({ logTo: ['splunk'] });
    }).toThrow();
  });

  it('should throw when logTo is splunk and splunk configurations are invalid', () => {
    expect(() => {
      initLogger({ logTo: ['splunk'], splunk: {} });
    }).toThrow();
  });

  // rest of the splunk tests are covered in Transport Tests
});
