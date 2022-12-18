import { Router } from 'express';
import sql from 'sequelize-config';
import { httpStatus } from 'constants/common';

import { internalServerError, notImplemented } from '../constants/errors';
import validateIdParam from '../middlewares/validateIdParam';

export const dogRouter = Router();

dogRouter.get('/', (req, res) => {
  const { Dog, Owner } = sql.sequelize.models;

  Dog.findAll({ include: Owner })
    .then(dogs => {
      return res.status(httpStatus.OK).send(dogs);
    })
    .catch(err => {
      return internalServerError(res, err);
    });
});

dogRouter.get('/notImplemented', (req, res) => {
  notImplemented(res);
});

dogRouter.get('/:id', validateIdParam, (req, res) => {
  const id = Number(req.params.id);
  const { Dog, Owner } = sql.sequelize.models;

  Dog.findOne({ where: { id }, include: Owner })
    .then(dog => {
      if (dog) {
        return res.status(httpStatus.OK).send(dog);
      }
      return res.status(httpStatus.NOT_FOUND).send('Dog not found');
    })
    .catch(err => {
      return internalServerError(res, err);
    });
});

dogRouter.post('/', (req, res) => {
  const { Dog } = sql.sequelize.models;

  Dog.create(req.body)
    .then(dog => {
      return res.status(httpStatus.CREATED).send(dog);
    })
    .catch(err => {
      return internalServerError(res, err);
    });
});

dogRouter.put('/:id', validateIdParam, (req, res) => {
  const id = Number(req.params.id);
  const { Dog } = sql.sequelize.models;

  Dog.update(req.body, { where: { id } })
    .then(affectedRows => {
      if (affectedRows[0] === 0) {
        return res.status(httpStatus.NOT_FOUND).send('Dog not found');
      }
      return res.status(httpStatus.OK).send('Updated');
    })
    .catch(err => {
      return internalServerError(res, err);
    });
});

dogRouter.delete('/:id', validateIdParam, (req, res) => {
  const id = Number(req.params.id);
  const { Dog } = sql.sequelize.models;

  Dog.destroy({ where: { id } })
    .then(affectedRows => {
      if (affectedRows === 0) {
        return res.status(httpStatus.NOT_FOUND).send('Dog not found');
      }
      return res.status(httpStatus.OK).send('Deleted');
    })
    .catch(err => {
      return internalServerError(res, err);
    });
});
