import { DateTime, Duration } from 'luxon';

import Ledger from './Ledger';
import { LedgerItem, Intervals, StandardInterval } from '../models';

class WeeklyLedger extends Ledger {
  generateLineItemsForStandardIntervals(intervals: StandardInterval[]): LedgerItem[] {
    const { weeklyRent } = this.leaseDetails;
    return intervals.map(
      ({ intervalStartDate, intervalEndDate }) =>
        ({
          startDate: intervalStartDate,
          endDate: intervalEndDate,
          amount: weeklyRent,
        } as LedgerItem)
    );
  }

  generateIntervals(): Intervals {
    const intervals = this.splitIntoIntervals({ days: 7 });

    return intervals;
  }
}

export default WeeklyLedger;
