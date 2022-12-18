import { httpStatus } from 'constants/common';

class RoleGuard {
  static #User;

  /** @type {import('winston').Logger} */
  static #logger;

  /**
   * @param {SequelizeModel} User Sequelize model describing user-table that has the role information
   * @param {import('winston').Logger} logger
   */
  static init(User, logger) {
    if (typeof User?.findOne !== 'function') {
      throw new Error(
        'Role guard initialization failed, User is not a sequelize instance',
      );
    }
    this.#User = User;
    this.#logger = logger?.error ? logger : console;
  }

  /**
   *
   * @param {"ADMINISTRATOR" | "MODERATOR" | "USER"} requiredRole
   */
  static role(requiredRole) {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    return async (req, res, next) => {
      const authenticatedUser = req.user;
      if (!authenticatedUser) {
        return res.status(httpStatus.UNAUTHORIZED).send('User not logged int');
      }

      if (!requiredRole || requiredRole === 'USER') {
        return next();
      }

      const { email } = authenticatedUser;

      try {
        const user = await this.#User.findOne({
          where: { email: email.toLowerCase() },
        });

        if (!user) {
          return res.status(httpStatus.FORBIDDEN).send('Unauthorized');
        }

        // update request object with current user's id and authority
        req.user.authority = user.authority;
        req.user.id = user.id;

        if (
          requiredRole === 'ADMINISTRATOR' &&
          user.authority === 'ADMINISTRATOR'
        ) {
          return next();
        }

        if (
          requiredRole === 'MODERATOR' &&
          (user.authority === 'MODERATOR' || user.authority === 'ADMINISTRATOR')
        ) {
          return next();
        }
      } catch (err) {
        this.#logger.error(err);
        return res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .send('Something went wrong');
      }

      return res.status(httpStatus.FORBIDDEN).send('Unauthorized');
    };
  }
}

export const { init, role } = RoleGuard;
