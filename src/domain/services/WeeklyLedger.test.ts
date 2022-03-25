import WeeklyLedger from './WeeklyLedger';
import { LeaseDetails, PaymentFrequency, StandardInterval } from '../models';
describe('Weekly Ledger', () => {
  describe('generateDates', () => {
    it('should split given lease interval into weeks with only standard intervals', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-02T00:00:00.000Z'),
        endDate: new Date('2020-03-22T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const ledger = new WeeklyLedger();
      ledger.setLeaseDetails(leaseDetails);

      const dates = ledger.generateIntervals();

      expect(dates).toEqual({
        residualInterval: null,
        standardIntervals: [
          {
            intervalEndDate: new Date('2020-03-08T00:00:00.000Z'),
            intervalStartDate: new Date('2020-03-02T00:00:00.000Z'),
          },
          {
            intervalEndDate: new Date('2020-03-15T00:00:00.000Z'),
            intervalStartDate: new Date('2020-03-09T00:00:00.000Z'),
          },
          {
            intervalEndDate: new Date('2020-03-22T00:00:00.000Z'),
            intervalStartDate: new Date('2020-03-16T00:00:00.000Z'),
          },
        ],
      });
    });

    it('should split given lease interval into weeks with only residual interval', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-02T00:00:00.000Z'),
        endDate: new Date('2020-03-07T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const ledger = new WeeklyLedger();
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

    it('should split given lease interval into weeks with both standard residual intervals', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-02T00:00:00.000Z'),
        endDate: new Date('2020-03-26T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const ledger = new WeeklyLedger();
      ledger.setLeaseDetails(leaseDetails);

      const dates = ledger.generateIntervals();

      expect(dates).toEqual({
        residualInterval: {
          intervalEndDate: new Date('2020-03-26T00:00:00.000Z'),
          intervalStartDate: new Date('2020-03-23T00:00:00.000Z'),
          duration: 4,
        },
        standardIntervals: [
          {
            intervalEndDate: new Date('2020-03-08T00:00:00.000Z'),
            intervalStartDate: new Date('2020-03-02T00:00:00.000Z'),
          },
          {
            intervalEndDate: new Date('2020-03-15T00:00:00.000Z'),
            intervalStartDate: new Date('2020-03-09T00:00:00.000Z'),
          },
          {
            intervalEndDate: new Date('2020-03-22T00:00:00.000Z'),
            intervalStartDate: new Date('2020-03-16T00:00:00.000Z'),
          },
        ],
      });
    });
  });

  describe('generateLineItemsForStandardIntervals', () => {
    it('should generate weekly line items for given intervals', () => {
      const intervals = [
        {
          intervalEndDate: new Date('2020-03-08T00:00:00.000Z'),
          intervalStartDate: new Date('2020-03-02T00:00:00.000Z'),
        },
        {
          intervalEndDate: new Date('2020-03-15T00:00:00.000Z'),
          intervalStartDate: new Date('2020-03-09T00:00:00.000Z'),
        },
        {
          intervalEndDate: new Date('2020-03-22T00:00:00.000Z'),
          intervalStartDate: new Date('2020-03-16T00:00:00.000Z'),
        },
      ];
      const leaseDetails = {
        startDate: new Date('2020-03-02T00:00:00.000Z'),
        endDate: new Date('2020-03-22T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const ledger = new WeeklyLedger();
      ledger.setLeaseDetails(leaseDetails);

      const lineItems = ledger.generateLineItemsForStandardIntervals(intervals);

      expect(lineItems).toEqual([
        { amount: 555, endDate: new Date('2020-03-08T00:00:00.000Z'), startDate: new Date('2020-03-02T00:00:00.000Z') },
        { amount: 555, endDate: new Date('2020-03-15T00:00:00.000Z'), startDate: new Date('2020-03-09T00:00:00.000Z') },
        { amount: 555, endDate: new Date('2020-03-22T00:00:00.000Z'), startDate: new Date('2020-03-16T00:00:00.000Z') },
      ]);
    });

    it('should generate no weekly line items for none intervals', () => {
      const intervals: StandardInterval[] = [];
      const leaseDetails = {
        startDate: new Date('2020-03-02T00:00:00.000Z'),
        endDate: new Date('2020-03-07T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const ledger = new WeeklyLedger();
      ledger.setLeaseDetails(leaseDetails);

      const lineItems = ledger.generateLineItemsForStandardIntervals(intervals);

      expect(lineItems).toEqual([]);
    });
  });
});
