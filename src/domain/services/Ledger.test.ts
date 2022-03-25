import { ValidationError, ValidationErrorFieldInfo } from '../errors';
import { Intervals, StandardInterval, PaymentFrequency, LeaseDetails, LedgerItem } from '../models';
import Ledger from './Ledger';

class DummyLedger extends Ledger {
  generateIntervals(): Intervals {
    return {
      StandardInterval: [],
      ResidualInterval: null,
    } as unknown as Intervals;
  }

  generateLineItemsForStandardIntervals(intervals: StandardInterval[]): LedgerItem[] {
    return [] as unknown as LedgerItem[];
  }
}

describe('Ledger', () => {
  describe('setLeaseDetails', () => {
    it('should report error for invalid payment frequency', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-23T00:00:00.000Z'),
        endDate: new Date('2020-03-26T00:00:00.000Z'),
        frequency: 'test',
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as unknown as LeaseDetails;

      const dummyLedger = new DummyLedger();

      try {
        dummyLedger.setLeaseDetails(leaseDetails);
      } catch (error) {
        const { errors } = error as ValidationError;
        expect(errors.length).toEqual(1);
        expect(errors[0].field).toEqual('frequency');
        expect(errors[0].details).toEqual([
          new ValidationErrorFieldInfo('"frequency" must be one of [weekly, fortnightly, monthly]'),
        ]);
      }
    });

    it('should report error for weekly rate less then zero', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-23T00:00:00.000Z'),
        endDate: new Date('2020-03-26T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: -555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;

      const dummyLedger = new DummyLedger();

      try {
        dummyLedger.setLeaseDetails(leaseDetails);
      } catch (error) {
        const { errors } = error as ValidationError;
        expect(errors.length).toEqual(1);
        expect(errors[0].field).toEqual('weeklyRent');
        expect(errors[0].details).toEqual([new ValidationErrorFieldInfo('"weeklyRent" must be greater than 0')]);
      }
    });

    it('should report error for invalid time zone', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-23T00:00:00.000Z'),
        endDate: new Date('2020-03-26T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: 555,
        timezone: 'Australia/Test',
      } as LeaseDetails;

      const dummyLedger = new DummyLedger();

      try {
        dummyLedger.setLeaseDetails(leaseDetails);
      } catch (error) {
        const { errors } = error as ValidationError;
        expect(errors.length).toEqual(1);
        expect(errors[0].field).toEqual('timezone');
        expect(errors[0].details).toEqual([new ValidationErrorFieldInfo('"timezone" contains an invalid value')]);
      }
    });
  });

  describe('generateLineItemForResidualInterval', () => {
    it('should generate line item for residual interval', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-23T00:00:00.000Z'),
        endDate: new Date('2020-03-26T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;

      const residualInterval = {
        intervalEndDate: new Date('2020-03-26T00:00:00.000Z'),
        intervalStartDate: new Date('2020-03-23T00:00:00.000Z'),
        duration: 4,
      };

      const dummyLedger = new DummyLedger();
      dummyLedger.setLeaseDetails(leaseDetails);

      const ledgerItem = dummyLedger.generateLineItemForResidualInterval(residualInterval);

      expect(ledgerItem).toEqual({
        amount: 317.14,
        endDate: new Date('2020-03-26T00:00:00.000Z'),
        startDate: new Date('2020-03-23T00:00:00.000Z'),
      });
    });

    it('should not generate line item for no residual interval', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-02T00:00:00.000Z'),
        endDate: new Date('2020-03-08T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;

      const dummyLedger = new DummyLedger();
      dummyLedger.setLeaseDetails(leaseDetails);

      const ledgerItem = dummyLedger.generateLineItemForResidualInterval(null);

      expect(ledgerItem).toBeNull;
    });
  });

  describe('generateLineItems', () => {
    const standardIntervalLineItems = [
      {
        amount: 555,
        endDate: new Date('2020-03-08T00:00:00.000Z'),
        startDate: new Date('2020-03-02T00:00:00.000Z'),
      },
      {
        amount: 555,
        endDate: new Date('2020-03-15T00:00:00.000Z'),
        startDate: new Date('2020-03-09T00:00:00.000Z'),
      },
      {
        amount: 555,
        endDate: new Date('2020-03-22T00:00:00.000Z'),
        startDate: new Date('2020-03-16T00:00:00.000Z'),
      },
    ];

    const residualIntervalLineItem = {
      amount: 317.14,
      endDate: new Date('2020-03-26T00:00:00.000Z'),
      startDate: new Date('2020-03-23T00:00:00.000Z'),
    };

    it('should generate line items with only standard intervals for a given lease duration', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-02T00:00:00.000Z'),
        endDate: new Date('2020-03-22T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const dummyLedger = new DummyLedger();
      dummyLedger.setLeaseDetails(leaseDetails);
      dummyLedger.generateLineItemsForStandardIntervals = jest.fn().mockImplementation(() => standardIntervalLineItems);
      dummyLedger.generateLineItemForResidualInterval = jest.fn().mockImplementation(() => null);

      const lineItems = dummyLedger.generateLineItems();

      expect(lineItems).toEqual({ items: standardIntervalLineItems });
    });

    it('should generate line item with only residual interval for a given lease duration', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-23T00:00:00.000Z'),
        endDate: new Date('2020-03-26T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const dummyLedger = new DummyLedger();
      dummyLedger.setLeaseDetails(leaseDetails);
      dummyLedger.generateLineItemsForStandardIntervals = jest.fn().mockImplementation(() => []);
      dummyLedger.generateLineItemForResidualInterval = jest.fn().mockImplementation(() => residualIntervalLineItem);

      const lineItems = dummyLedger.generateLineItems();

      expect(lineItems).toEqual({ items: [residualIntervalLineItem] });
    });

    it('should generate line items with standard and residual intervals for a given lease duration', () => {
      const leaseDetails = {
        startDate: new Date('2020-03-02T00:00:00.000Z'),
        endDate: new Date('2020-03-26T00:00:00.000Z'),
        frequency: PaymentFrequency.WEEKLY,
        weeklyRent: 555,
        timezone: 'Australia/Sydney',
      } as LeaseDetails;
      const dummyLedger = new DummyLedger();
      dummyLedger.setLeaseDetails(leaseDetails);
      dummyLedger.generateLineItemsForStandardIntervals = jest.fn().mockImplementation(() => standardIntervalLineItems);
      dummyLedger.generateLineItemForResidualInterval = jest.fn().mockImplementation(() => residualIntervalLineItem);

      const lineItems = dummyLedger.generateLineItems();

      expect(lineItems).toEqual({ items: [...standardIntervalLineItems, residualIntervalLineItem] });
    });
  });
});
