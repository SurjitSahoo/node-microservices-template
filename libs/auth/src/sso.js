import * as jose from 'jose';

class Auth {
  /**
   * @type {import('winston').Logger}
   */
  static #logger;

  static #JWKS;

  /**
   * @type {string}
   */
  static #headerName;

  static #initialized = false;

  /**
   * Initialize authentication module
   * @param {string | URL} jwksUri - JWKS URI for OAuth token validation
   * @param {import('winston').Logger} [logger=] - Logger | default - console
   * @param {string} [headerNameForToken='authorization']
   */
  static init(jwksUri, logger, headerNameForToken = 'authorization') {
    this.#logger = logger ?? console;

    if (!jwksUri || jwksUri.length === 0) {
      throw new Error('JWKS_URL is required');
    }

    this.#headerName = headerNameForToken;

    this.#JWKS = jose.createRemoteJWKSet(new URL(jwksUri));
    this.#initialized = true;
  }

  /**
   * @param {Request} request
   * @param {Response} response
   * @param {NextFunction} next
   * @returns {void}
   */
  static async authenticate(request, response, next) {
    if (!this.#initialized) {
      throw new Error('Authentication module not initialized');
    }

    /**
     * @type string
     */
    const authorization = request.headers[this.#headerName];

    if (!authorization) {
      return response.status(401).send();
    }

    const authHeaderParts = authorization.split(' ');

    if (authHeaderParts.length !== 2 || authHeaderParts[0] !== 'Bearer') {
      return response.status(401).send();
    }

    const token = authHeaderParts[1];

    if (!token) {
      return response
        .status(401)
        .send('Invalid token or Bearer token is empty');
    }

    try {
      const { payload } = await jose.jwtVerify(token, this.#JWKS, {
        // issuer: process.env.OAUTH_PROVIDER,
      });

      request.user = payload;

      return next();
    } catch (err) {
      this.#logger.error(err);
      return response.status(401).send();
    }
  }
}

export const { init, authenticate } = Auth;
