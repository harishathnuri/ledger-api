import { PaymentFrequency } from '../models';
import Ledger from '../services/Ledger';
import WeeklyLedger from '../services/WeeklyLedger';
import FortnightlyLedger from '../services/FortnightlyLedger';
import MonthlyLedger from '../services/MonthlyLedger';

export function ledgerFactory(frequency: PaymentFrequency): Ledger {
  let ledger: Ledger;
  switch (frequency) {
    case PaymentFrequency.WEEKLY: {
      ledger = new WeeklyLedger();
      break;
    }
    case PaymentFrequency.FORTNIGHTLY: {
      ledger = new FortnightlyLedger();
      break;
    }
    case PaymentFrequency.MONTHLY: {
      ledger = new MonthlyLedger();
      break;
    }
    default:
      const exhaustiveCheck: never = frequency;
      throw new Error(exhaustiveCheck);
  }

  return ledger;
}
