import { NextFunction, Request, Response, Router } from 'express';

export default (): Router => {
  const router = Router();

  router.get('/', async (req: Request, res: Response, next?: NextFunction): Promise<any> => {
    res.status(200).send({
      status: 'Healthy',
    });
  });

  return router;
};
