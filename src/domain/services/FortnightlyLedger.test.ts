import FortnightlyLedger from './FortnightlyLedger';
import { LeaseDetails, PaymentFrequency } from '../models';

describe('Fortnightly Ledger', () => {
  describe('generateIntervals', () => {
    it('should split given lease interval into fortnight with only standard intervals', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-28T00:00:00.000Z'),
        endDate: new Date('2020-05-22T01:00:00.000Z'),
        frequency: PaymentFrequency.FORTNIGHTLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const ledger = new FortnightlyLedger();
      ledger.setLeaseDetails(leaseDetails);

      const dates = ledger.generateIntervals();

      expect(dates).toEqual({
        residualInterval: null,
        standardIntervals: [
          {
            intervalEndDate: new Date('2020-04-10T01:00:00.000Z'),
            intervalStartDate: new Date('2020-03-28T00:00:00.000Z'),
          },
          {
            intervalEndDate: new Date('2020-04-24T01:00:00.000Z'),
            intervalStartDate: new Date('2020-04-11T01:00:00.000Z'),
          },
          {
            intervalEndDate: new Date('2020-05-08T01:00:00.000Z'),
            intervalStartDate: new Date('2020-04-25T01:00:00.000Z'),
          },
          {
            intervalEndDate: new Date('2020-05-22T01:00:00.000Z'),
            intervalStartDate: new Date('2020-05-09T01:00:00.000Z'),
          },
        ],
      });
    });

    it('should split given lease interval into fortnight with only residual interval', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-02T00:00:00.000Z'),
        endDate: new Date('2020-03-07T00:00:00.000Z'),
        frequency: PaymentFrequency.FORTNIGHTLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const ledger = new FortnightlyLedger();
      ledger.setLeaseDetails(leaseDetails);

      const dates = ledger.generateIntervals();

      expect(dates).toEqual({
        residualInterval: {
          intervalEndDate: new Date('2020-03-07T00:00:00.000Z'),
          intervalStartDate: new Date('2020-03-02T00:00:00.000Z'),
          duration: 6,
        },
        standardIntervals: [],
      });
    });
  });

  it('should split given lease interval into fortnight with both standard residual intervals', () => {
    const leaseDetails = {
      startDate: new Date('2020-03-28T00:00:00.000Z'),
      endDate: new Date('2020-05-27T00:00:00.000Z'),
      frequency: PaymentFrequency.FORTNIGHTLY,
      weeklyRent: 555,
      timezone: 'Australia/Sydney',
    } as LeaseDetails;
    const ledger = new FortnightlyLedger();
    ledger.setLeaseDetails(leaseDetails);

    const dates = ledger.generateIntervals();

    expect(dates).toEqual({
      residualInterval: {
        intervalEndDate: new Date('2020-05-27T00:00:00.000Z'),
        intervalStartDate: new Date('2020-05-23T01:00:00.000Z'),
        duration: 5,
      },
      standardIntervals: [
        {
          intervalEndDate: new Date('2020-04-10T01:00:00.000Z'),
          intervalStartDate: new Date('2020-03-28T00:00:00.000Z'),
        },
        {
          intervalEndDate: new Date('2020-04-24T01:00:00.000Z'),
          intervalStartDate: new Date('2020-04-11T01:00:00.000Z'),
        },
        {
          intervalEndDate: new Date('2020-05-08T01:00:00.000Z'),
          intervalStartDate: new Date('2020-04-25T01:00:00.000Z'),
        },
        {
          intervalEndDate: new Date('2020-05-22T01:00:00.000Z'),
          intervalStartDate: new Date('2020-05-09T01:00:00.000Z'),
        },
      ],
    });
  });
});
