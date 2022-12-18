import express from 'express';

import { dogRouter } from '../controllers/dog';
import { ownerRouter } from '../controllers/owner';

const apiRouter = express.Router();

/**
 * How to add middleware in route level
 * apiRouter.use('/path', middleware1, middleware2, ...., router);
 */
apiRouter.use('/example', dogRouter);
apiRouter.use('/article', ownerRouter);

export default apiRouter;
