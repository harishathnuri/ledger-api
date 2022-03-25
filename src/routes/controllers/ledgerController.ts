import { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';

import { LeaseDetails } from '../../domain/models';
import { ValidationError } from '../../domain/errors';
import { validate } from '../../domain/utils';
import { schema as leaseDetailsRequestParametersSchema } from './schemas/leaseDetailsRequestParametersSchema';
import { ledgerFactory } from '../../domain/helpers/ledgerFactory';

async function getLedger(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    // validaton of domain payload
    let requestParams = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      frequency: req.query.frequency,
      weekly_rent: req.query.weekly_rent,
      timezone: req.query.timezone,
    };

    const validationErrorDetails = validate(leaseDetailsRequestParametersSchema, requestParams);
    if (validationErrorDetails.length > 0) {
      throw new ValidationError(validationErrorDetails);
    }

    // map request params to domain model
    const leaseDetails = {
      startDate: new Date(requestParams.start_date! as string),
      endDate: new Date(requestParams.end_date! as string),
      frequency: requestParams.frequency! as string,
      weeklyRent: parseInt(requestParams.weekly_rent! as string),
      timezone: requestParams.timezone! as string,
    } as unknown as LeaseDetails;

    const ledger = ledgerFactory(leaseDetails.frequency);
    ledger.setLeaseDetails(leaseDetails);

    const ledgerItems = ledger.generateLineItems();

    // map domain model to api response
    const response = ledgerItems.items.map((item) => ({
      start_date: DateTime.fromISO(item.startDate.toISOString()).toFormat('MMMM dd, yyyy'),
      end_date: DateTime.fromISO(item.endDate.toISOString()).toFormat('MMMM dd, yyyy'),
      amount: item.amount,
    }));

    res.status(200).send({
      data: response,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      error.message = 'Lease details could not be validated.';
      res.status(400);
    }
    return next(error);
  }
}

export { getLedger };
