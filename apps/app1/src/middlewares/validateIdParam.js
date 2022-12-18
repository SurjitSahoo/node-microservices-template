import { invalidParam } from '../constants/errors';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export default function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return invalidParam(res);
  }
  return next();
}
