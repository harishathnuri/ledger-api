import { Application } from 'express';
import HttpStatus from 'http-status-codes';
import supertest from 'supertest';

import configFactory from '../src/config';
import getApp from '../src/app';

const config = configFactory();

describe('ledger api', () => {
  let app: Application;
  beforeAll(() => {
    app = getApp(config);
  });
  test('weekly', async () => {
    const response = await supertest(app)
      .get('/ledger')
      .query({
        start_date: '2020-03-02T00:00:00.000Z',
        end_date: '2020-03-22T00:00:00.000Z',
        frequency: 'weekly',
        weekly_rent: 555,
        timezone: 'Australia/Sydney',
      })
      .expect(HttpStatus.OK);

    expect(response.body.data).toStrictEqual([
      { start_date: 'March 02, 2020', end_date: 'March 08, 2020', amount: 555 },
      { start_date: 'March 09, 2020', end_date: 'March 15, 2020', amount: 555 },
      { start_date: 'March 16, 2020', end_date: 'March 22, 2020', amount: 555 },
    ]);
  });

  test('fortnightly', async () => {
    const response = await supertest(app)
      .get('/ledger')
      .query({
        start_date: '2020-03-02T00:00:00.000Z',
        end_date: '2020-03-22T00:00:00.000Z',
        frequency: 'fortnightly',
        weekly_rent: 555,
        timezone: 'Australia/Sydney',
      })
      .expect(HttpStatus.OK);
    expect(response.body.data).toStrictEqual([
      { start_date: 'March 02, 2020', end_date: 'March 15, 2020', amount: 1110 },
      { start_date: 'March 16, 2020', end_date: 'March 22, 2020', amount: 555 },
    ]);
  });

  test('monthly', async () => {
    const response = await supertest(app)
      .get('/ledger')
      .query({
        start_date: '2020-01-31T00:00:00+0000',
        end_date: '2020-06-29T00:00:00+0000',
        frequency: 'monthly',
        weekly_rent: 555,
        timezone: 'Australia/Sydney',
      })
      .expect(HttpStatus.OK);
    expect(response.body.data).toStrictEqual([
      { start_date: 'January 31, 2020', end_date: 'February 28, 2020', amount: 2411.61 },
      { start_date: 'February 29, 2020', end_date: 'March 30, 2020', amount: 2411.61 },
      { start_date: 'March 31, 2020', end_date: 'April 29, 2020', amount: 2411.61 },
      { start_date: 'April 30, 2020', end_date: 'May 30, 2020', amount: 2411.61 },
      { start_date: 'May 31, 2020', end_date: 'June 29, 2020', amount: 2411.61 },
    ]);
  });
});
