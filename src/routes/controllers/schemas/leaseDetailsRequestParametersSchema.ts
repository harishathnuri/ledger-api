import Joi from 'joi';

import { PaymentFrequency } from '../../../domain/models/paymentFrequency';

const schema = {
  start_date: Joi.string().isoDate().required(),
  end_date: Joi.string().isoDate().required(),
  frequency: Joi.string()
    .valid(...Object.values(PaymentFrequency))
    .required(),
  weekly_rent: Joi.number().greater(0).required(),
  timezone: Joi.string().required(),
};

export { schema };
