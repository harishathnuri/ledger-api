import { DateTime, Duration } from 'luxon';

import Ledger from './Ledger';
import { LedgerItem, Intervals, StandardInterval } from '../models';

class MonthlyLedger extends Ledger {
  generateLineItemsForStandardIntervals(intervals: StandardInterval[]): LedgerItem[] {
    const { weeklyRent } = this.leaseDetails;
    return intervals.map(
      ({ intervalStartDate, intervalEndDate }) =>
        ({
          startDate: intervalStartDate,
          endDate: intervalEndDate,
          amount: Math.round((((weeklyRent / 7) * 365) / 12 + Number.EPSILON) * 100) / 100,
        } as LedgerItem)
    );
  }

  generateIntervals(): Intervals {
    const { startDate, endDate, timezone } = this.leaseDetails;
    const intervals = new Intervals();
    const leaseStartDate = DateTime.fromISO(startDate.toISOString(), { zone: timezone });
    const leaseEndDate = DateTime.fromISO(endDate.toISOString(), { zone: timezone });

    // flag to traverse through to the end of next month
    const isEndofMonth = leaseStartDate.endOf('month').toFormat('MM-dd-yyyy') == leaseStartDate.toFormat('MM-dd-yyyy');

    let intervalStartDate = leaseStartDate;
    let intervalEndDate = isEndofMonth
      ? intervalStartDate
          .plus(Duration.fromObject({ months: 1 }))
          .endOf('month')
          .minus({ day: 1 })
      : intervalStartDate.plus(Duration.fromObject({ months: 1 })).minus({ day: 1 });
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
      // ignoring time part for the same date
      intervalEndDate.toFormat('MM-dd-yyyy') === leaseEndDate.toFormat('MM-dd-yyyy')
    ) {
      intervals.standardIntervals.push({
        intervalStartDate: intervalStartDate.toJSDate(),
        intervalEndDate: intervalEndDate.toJSDate(),
      });

      intervalStartDate = intervalEndDate.plus(Duration.fromObject({ days: 1 }));
      intervalEndDate = isEndofMonth
        ? intervalStartDate
            .plus(Duration.fromObject({ months: 1 }))
            .endOf('month')
            .minus({ day: 1 })
        : intervalStartDate.plus(Duration.fromObject({ months: 1 })).minus({ day: 1 });
    }

    if (intervalStartDate < leaseEndDate) {
      intervals.residualInterval = {
        intervalStartDate: intervalStartDate.toJSDate(),
        intervalEndDate: leaseEndDate.toJSDate(),
        // ignoring the time
        duration: Math.round(leaseEndDate.diff(intervalStartDate, ['days']).toObject().days! + 1),
      };
    }

    return intervals;
  }
}

export default MonthlyLedger;
