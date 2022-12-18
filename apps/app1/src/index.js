import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as path from 'node:path';

import { init as initSequelize, db } from 'sequelize-config';
import logger, { initLogger } from 'logger';

import { env } from './config/env';
import apiRouter from './routes';
import { __srcDir } from './constants';
import { createAssociations } from './models/associations';

const app = express();

app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

initLogger();

initSequelize(
  new db.Sequelize({
    dialect: 'postgres',
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    username: env.POSTGRES_USERNAME,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DATABASE,
    logging: !env.isProd,
  }),
  path.join(__srcDir, 'models'),
  createAssociations,
  logger,
)
  .then(() => {
    // register root router
    app.use('/api', apiRouter);

    // catch 404 and forward to error handler
    app.use((_req, _res, next) => {
      const err = new Error('Route not found');
      err.status = 404;
      next(err);
    });

    app.use((err, _req, res, _next) => {
      res.status(err.status || 500);
      res.send(err.message);
    });

    app.listen(env.PORT, () => {
      logger.info(`Server started on port ${env.PORT}...`);
    });
  })
  .catch(err => {
    logger.error(err);
    throw err;
  });
