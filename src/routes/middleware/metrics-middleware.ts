import { NextFunction, Request, Response } from 'express';
import * as onHeaders from 'on-headers';
import { httpRequestErrors, httpRequestsDuration, httpRequestsTotal, httpResponseErrors } from '../../utils/metrics';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.route) {
    return next();
  }

  const start = process.hrtime();
  const label = { route_id: req.route.path };

  onHeaders(res, () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1e3 + nanoseconds * 1e-6;
    // const size = parseInt(res.getHeader('content-length') || '0', 10);

    httpRequestsDuration(label, duration);

    httpRequestsTotal({
      method: req.method,
      path: req.path,
      status: res.statusCode,
    });

    if (res.statusCode >= 400 && res.statusCode < 500) {
      httpRequestErrors({
        method: req.method,
        path: req.path,
        status: res.statusCode,
      });
    }

    if (res.statusCode >= 500) {
      httpResponseErrors({
        method: req.method,
        path: req.path,
        status: res.statusCode,
      });
    }

    next();
  });
};
