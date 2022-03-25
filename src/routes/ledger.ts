import express, { Router } from 'express';

import { ErrorHandlerMiddleware } from './middleware';
import { getLedger } from './controllers/ledgerController';

export default (): Router => {
  const router = Router();

  router.use(express.urlencoded({ extended: false }));
  router.use(express.json());

  router.get('/', getLedger);

  router.use(ErrorHandlerMiddleware);

  return router;
};
