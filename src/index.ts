import getApp from './app';
import configFactory from './config';

const config = configFactory();

const app = getApp(config);

app.listen(config.port, () => {
  console.log(`Application started at ${config.port}`);
});
