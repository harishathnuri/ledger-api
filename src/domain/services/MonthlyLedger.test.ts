import MonthlyLedger from './MonthlyLedger';
import { LeaseDetails, PaymentFrequency } from '../models';

describe('Monthly Ledger', () => {
  describe('generateIntervals', () => {
    it('should split given lease interval into month with only standard intervals', () => {
      const leaseDetails = {
        startDate: new Date('2020-01-31T00:00:00.000Z'),
        endDate: new Date('2020-06-29T00:00:00.000Z'),
        frequency: PaymentFrequency.MONTHLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const ledger = new MonthlyLedger();
      ledger.setLeaseDetails(leaseDetails);

      const dates = ledger.generateIntervals();

      expect(dates).toEqual({
        residualInterval: null,
        standardIntervals: [
          {
            intervalEndDate: new Date('2020-02-28T12:59:59.999Z'),
            intervalStartDate: new Date('2020-01-31T00:00:00.000Z'),
          },
          {
            intervalEndDate: new Date('2020-03-30T12:59:59.999Z'),
            intervalStartDate: new Date('2020-02-29T12:59:59.999Z'),
          },
          {
            intervalEndDate: new Date('2020-04-29T13:59:59.999Z'),
            intervalStartDate: new Date('2020-03-31T12:59:59.999Z'),
          },
          {
            intervalEndDate: new Date('2020-05-30T13:59:59.999Z'),
            intervalStartDate: new Date('2020-04-30T13:59:59.999Z'),
          },
          {
            intervalEndDate: new Date('2020-06-29T13:59:59.999Z'),
            intervalStartDate: new Date('2020-05-31T13:59:59.999Z'),
          },
        ],
      });
    });

    it('should split given lease interval into month with only residual interval', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-02T00:00:00.000Z'),
        endDate: new Date('2020-03-07T00:00:00.000Z'),
        frequency: PaymentFrequency.MONTHLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const ledger = new MonthlyLedger();
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

  it('should split given lease interval into month with both standard residual intervals', () => {
    const leaseDetails = {
      startDate: new Date('2020-01-31T00:00:00.000Z'),
      endDate: new Date('2020-03-23T00:00:00.000Z'),
      frequency: PaymentFrequency.MONTHLY,
      weeklyRent: 555,
      timezone: 'Australia/Sydney',
    } as LeaseDetails;
    const ledger = new MonthlyLedger();
    ledger.setLeaseDetails(leaseDetails);

    const dates = ledger.generateIntervals();

    expect(dates).toEqual({
      residualInterval: {
        intervalEndDate: new Date('2020-03-23T00:00:00.000Z'),
        intervalStartDate: new Date('2020-02-29T12:59:59.999Z'),
        duration: 23,
      },
      standardIntervals: [
        {
          intervalEndDate: new Date('2020-02-28T12:59:59.999Z'),
          intervalStartDate: new Date('2020-01-31T00:00:00.000Z'),
        },
      ],
    });
  });
});
