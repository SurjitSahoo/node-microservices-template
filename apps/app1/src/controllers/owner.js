import express from 'express';

export const ownerRouter = express.Router();

ownerRouter.get('/:id', (request, response) => {
  /**
   * #swagger.tags = ['Example']
   * #swagger.description = 'Get one example'
   * #swagger.parameters['id']= { description: 'Id of the example' }
   */
  response.status(200).send({ data: `example ${request.params.id}` });
});

ownerRouter.get('/', (request, response) => {
  /**
   * #swagger.tags=['Example']
   * #swagger.description = 'Get all examples'
   */
  response.status(200).send(['example 1', 'example 2', 'example 3']);
});

ownerRouter.post('/', (request, response) => {
  /**
   * #swagger.tags=['Example']
   * #swagger.description = 'Create an example'
   */
  const { name, description } = request.body;
  response.status(201).send({ id: 'some-id', details: { name, description } });
});

ownerRouter.put('/', (request, response) => {
  /**
   * #swagger.tags=['Example']
   * #swagger.description = 'Update an example'
   */
  response
    .status(200)
    .send({ id: request.body.exampleId, updatedWith: request.body.updateInfo });
});

ownerRouter.delete('/:id', (request, response) => {
  /**
   * #swagger.tags=['Example']
   * #swagger.description = 'Delete an example'
   */
  response.status(200).send(`id: ${request.params.id} deleted`);
});
