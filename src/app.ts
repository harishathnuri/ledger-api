import express, { Application, Request, Response } from 'express';
import requestLogger from 'morgan';

import { Config } from './config';
import defaultRoutes from './routes';
import ledgerRoutes from './routes/ledger';

export default (config: Config): Application => {
  const app = express();

  if (config.env !== 'production') {
    app.use(requestLogger('tiny'));
  }

  app.use('/ledger', ledgerRoutes());

  app.use('/', defaultRoutes());

  app.all('*', (req: Request, res: Response) => {
    res.status(404).send({
      type: '/problem/not-found',
      title: 'Not Found',
      status: 404,
      detail: 'The requested resource was not found',
      instance: req.url,
    });
  });

  return app;
};
