import { errorMsgs, httpStatus } from 'constants/common';
import logger from 'logger';

/**
 *  @param {import('express').Response} res
 * @param {Error} [error=]
 */
export function internalServerError(res, error) {
  if (error) logger.error(error);

  return res
    .status(httpStatus.INTERNAL_SERVER_ERROR)
    .send(errorMsgs.SERVER_ERROR);
}

/**
 *  @param {import('express').Response} res
 */
export function notImplemented(res) {
  return res.status(httpStatus.NOT_IMPLEMENTED).send('API not implemented');
}

/**
 *  @param {import('express').Response} res
 */
export function invalidParam(res) {
  return res.status(httpStatus.BAD_REQUEST).send('invalid ID');
}
