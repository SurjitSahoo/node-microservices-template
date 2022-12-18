import { DataTypes, Sequelize } from 'sequelize';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * @type {Sequelize}
 */
let _sequelize;

export const db = {
  Sequelize,
  DataTypes,
  sequelize: _sequelize,
};

/**
 * Initialize SQL module
 * @param {Sequelize} sequelizeInstance - sequelize instance i.e new Sequelize(...params)
 * @param {fs.PathLike} modelsDir - node:path directory of model definitions
 * @param {() => void} [createAssociations=] - Function to define model associations
 * @param {import('winston').Logger} [logger=] - Winston logger instance
 */

export function init(sequelizeInstance, modelsDir, createAssociations, logger) {
  return new Promise((resolve, reject) => {
    db.sequelize = sequelizeInstance;

    const _logger = logger && logger.info && logger.error ? logger : console;

    try {
      /**
       * Load all the model definitions
       */
      const modelImports = [];

      fs.readdirSync(modelsDir)
        .filter(file => file.startsWith('.') === false && file.endsWith('.js'))
        .forEach(file => {
          const path = join(modelsDir, file);
          modelImports.push(
            // eslint-disable-next-line node/no-unsupported-features/es-syntax
            import(pathToFileURL(path)).then(module => {
              module.default();
            }),
          );
        });

      Promise.all(modelImports)
        .then(() => {
          /**
           * Apply model associations
           */
          if (createAssociations) createAssociations();

          /**
           * Connect to database
           */
          db.sequelize
            .authenticate()
            .then(() => {
              _logger.info(
                `Connected to ${db.sequelize.getDialect()} database: ${db.sequelize.getDatabaseName()}`,
              );
              db.sequelize.sync();
              resolve();
            })
            .catch(err => {
              _logger.error(err);
              reject(err);
            });
        })
        .catch(err => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
}

export default db;
