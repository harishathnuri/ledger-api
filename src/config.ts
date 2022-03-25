export type Config = {
  serviceName: string;
  apiVersion: number;
  port: number;
  env: string;
};

export default (): Config => {
  return {
    serviceName: 'ledger-api',
    apiVersion: (process.env?.API_VERSION && parseInt(process.env.API_VERSION)) || 1,
    port: (process.env?.PORT && parseInt(process.env.PORT)) || 3000,
    env: process.env.NODE_ENV || 'local',
  };
};
