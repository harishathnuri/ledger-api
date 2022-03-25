import Joi from 'joi';
import { DateTime } from 'luxon';

import { PaymentFrequency } from '../paymentFrequency';

const schema = {
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  frequency: Joi.string()
    .valid(...Object.values(PaymentFrequency))
    .required(),
  weeklyRent: Joi.number().greater(0).required(),
  timezone: Joi.string()
    .custom((value, helpers) => {
      if (DateTime.local().setZone(value).isValid) {
        return value;
      }
      return helpers.error('any.invalid');
    })
    .required(),
};

export { schema };
