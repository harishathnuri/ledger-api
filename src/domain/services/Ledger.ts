import {
  LedgerItem,
  LedgerItems,
  LeaseDetails,
  Intervals,
  ResidualInterval,
  StandardInterval,
  leaseDetailsSchema,
} from '../models';
import { validate } from '../utils';
import { ValidationError } from '../errors';
import { DateTime, Duration } from 'luxon';

abstract class Ledger {
  // validate lease details
  protected leaseDetails: LeaseDetails;

  setLeaseDetails(leaseDetails: LeaseDetails) {
    const validationErrorDetails = validate(leaseDetailsSchema, leaseDetails);
    if (validationErrorDetails.length > 0) {
      throw new ValidationError(validationErrorDetails);
    }
    this.leaseDetails = leaseDetails;
  }

  generateLineItems(): LedgerItems {
    // divide lease duration into given frequency
    const intervals = this.generateIntervals();
    // generate line items for standard intervals
    let standardItems = this.generateLineItemsForStandardIntervals(intervals.standardIntervals);
    // generate line item for residual interval
    let residualItem = this.generateLineItemForResidualInterval(intervals.residualInterval);

    if (standardItems.length > 0 && residualItem) {
      return { items: [...standardItems, residualItem] };
    } else if (residualItem) {
      return { items: [residualItem] };
    } else {
      return { items: [...standardItems] };
    }
  }

  splitIntoIntervals(intervalDuration: { days?: number; months?: number }): Intervals {
    const { startDate, endDate, timezone } = this.leaseDetails;
    const intervals = new Intervals();
    const leaseStartDate = DateTime.fromISO(startDate.toISOString(), { zone: timezone });
    const leaseEndDate = DateTime.fromISO(endDate.toISOString(), { zone: timezone });

    let intervalStartDate = leaseStartDate;
    let intervalEndDate = intervalStartDate
      .plus(Duration.fromObject(intervalDuration))
      .minus(Duration.fromObject({ days: 1 }));
    if (intervalEndDate > leaseEndDate) {
      intervals.residualInterval = {
        intervalStartDate: intervalStartDate.toJSDate(),
        intervalEndDate: leaseEndDate.toJSDate(),
        duration: Math.round(leaseEndDate.diff(leaseStartDate, ['days']).toObject().days! + 1),
      };
      return intervals;
    }

    while (
      intervalEndDate <= leaseEndDate ||
      // ignoring time part of the same date
      intervalEndDate.toFormat('MM-dd-yyyy') === leaseEndDate.toFormat('MM-dd-yyyy')
    ) {
      intervals.standardIntervals.push({
        intervalStartDate: intervalStartDate.toJSDate(),
        intervalEndDate: intervalEndDate.toJSDate(),
      });

      intervalStartDate = intervalEndDate.plus(Duration.fromObject({ days: 1 }));
      intervalEndDate = intervalStartDate
        .plus(Duration.fromObject(intervalDuration))
        .minus(Duration.fromObject({ days: 1 }));
    }

    if (intervalStartDate < leaseEndDate) {
      intervals.residualInterval = {
        intervalStartDate: intervalStartDate.toJSDate(),
        intervalEndDate: leaseEndDate.toJSDate(),
        duration: Math.round(leaseEndDate.diff(intervalStartDate, ['days']).toObject().days! + 1),
      };
    }

    return intervals;
  }

  abstract generateIntervals(): Intervals;

  abstract generateLineItemsForStandardIntervals(intervals: StandardInterval[]): LedgerItem[];

  generateLineItemForResidualInterval(interval: Nullable<ResidualInterval>): Nullable<LedgerItem> {
    const { weeklyRent } = this.leaseDetails;
    if (!interval) {
      return null;
    }
    const { intervalStartDate, intervalEndDate, duration } = interval;
    const amount = Math.round(((weeklyRent / 7) * duration + Number.EPSILON) * 100) / 100;

    return {
      startDate: intervalStartDate,
      endDate: intervalEndDate,
      amount: amount,
    } as unknown as LedgerItem;
  }
}

export default Ledger;
