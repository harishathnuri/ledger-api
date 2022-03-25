import { DateTime, Duration } from 'luxon';

import Ledger from './Ledger';
import { LedgerItem, Intervals, StandardInterval } from '../models';

class FortnightlyLedger extends Ledger {
  generateLineItemsForStandardIntervals(intervals: StandardInterval[]): LedgerItem[] {
    const { weeklyRent } = this.leaseDetails;
    return intervals.map(
      ({ intervalStartDate, intervalEndDate }) =>
        ({
          startDate: intervalStartDate,
          endDate: intervalEndDate,
          amount: weeklyRent * 2,
        } as LedgerItem)
    );
  }

  generateIntervals(): Intervals {
    const intervals = this.splitIntoIntervals({ days: 14 });

    return intervals;
  }
}

export default FortnightlyLedger;
