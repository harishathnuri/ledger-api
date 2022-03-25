import { PaymentFrequency } from './paymentFrequency';
import { schema as leaseDetailsSchema } from './schemas/leaseDetailsSchema';

export class LeaseDetails {
  startDate: Date;
  endDate: Date;
  frequency: PaymentFrequency;
  weeklyRent: number;
  timezone: string;
}

export { leaseDetailsSchema };
