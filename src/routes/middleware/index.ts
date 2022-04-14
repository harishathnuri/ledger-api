import { Request, Response, NextFunction } from 'express';

import { ErrorMessage, Problem } from '../util/Problem';
import { ValidationError } from '../../domain/errors';

export function ErrorHandlerMiddleware(error: Error, req: Request, res: Response, next?: NextFunction): void {
  let status = res.statusCode || 500;

  if (error instanceof SyntaxError) {
    status = 400;
  }

  const problemMap = new Map<number, any>([
    [400, { type: 'bad-request', title: 'Bad Request' }],
    [403, { type: 'forbidden', title: 'Forbidden' }],
    [404, { type: 'not-found', title: 'Not Found' }],
    [500, { type: 'internal-server-error', title: 'Internal Server Error' }],
  ]);

  let type = '';
  let title = '';
  let messages: Optional<ErrorMessage[]>;

  if (error instanceof ValidationError) {
    status = 400;
    type = 'validation-error';
    title = 'Validation Error';
    messages = error.errors.map((error) => {
      const reasons = error.details.map((detail) => detail.message);
      return {
        name: error.field || '',
        reason: reasons,
      };
    });
  } else {
    status = 500;
    type = problemMap.get(status)?.type || 'unknown';
    title = problemMap.get(status)?.title || 'unknown';
  }

  const problem: Problem = {
    type: `/problems/${type}`,
    title,
    status,
    detail: status === 500 ? '' : error.message || 'Unknown',
    instance: req.url,
    messages,
  };

  res.status(status);
  res.contentType('application/problem+json');
  res.json(problem);
}
