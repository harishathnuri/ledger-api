import * as client from 'prom-client';

const registry = new client.Registry();

const createCounter = (name: string, labelNames: string[]) => {
  const counter = new client.Counter({
    name,
    help: name,
    labelNames,
    registers: [registry],
  });

  return (labels: Record<string, string | number>) => counter.inc(labels);
};

const createSummary = (name: string, labelNames: string[]) => {
  const summary = new client.Summary({
    name,
    help: name,
    labelNames,
    registers: [registry],
  });

  return (labels: Record<string, string | number>, value: number) => summary.observe(labels, value);
};

export const httpRequestsTotal = createCounter('http_requests_total', ['method', 'path', 'status']);
export const httpRequestsDuration = createSummary('http_requests_duration', ['method', 'path', 'status']);
export const httpRequestsSize = createSummary('http_requests_size', ['method', 'path', 'status']);
export const httpRequestErrors = createCounter('http_response_errors', ['method', 'path', 'status']);
export const httpResponsesSize = createSummary('http_responses_size', ['method', 'path', 'status']);
export const httpResponseErrors = createCounter('http_response_errors', ['method', 'path', 'status']);
export const httpResonsesTimeouts = createCounter('http_response_timeouts', ['method', 'path', 'status']);

export const metrics = {
  httpRequestsTotal,
  httpRequestsDuration,
  httpRequestsSize,
  httpRequestErrors,
  httpResponsesSize,
  httpResponseErrors,
  httpResonsesTimeouts,
};
