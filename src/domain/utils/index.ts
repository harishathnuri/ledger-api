import Joi from 'joi';

import { ValidationErrorFieldInfo, ValidationErrorInfo } from '../errors';

export function formatErrors(validations: Joi.ValidationResult): ValidationErrorInfo[] {
  const { error } = validations;
  const validationErrorInfo: ValidationErrorInfo[] = [];
  if (error) {
    error.details.forEach((info) => {
      const field = info?.path.toString() || '';
      const index = validationErrorInfo.findIndex((info) => info.field === field);
      if (index >= 0) {
        validationErrorInfo[index].details = [
          ...validationErrorInfo[index].details,
          new ValidationErrorFieldInfo(info.message),
        ];
      } else {
        validationErrorInfo.push({
          field: field,
          details: [new ValidationErrorFieldInfo(info.message)],
        });
      }
    });
  }
  return validationErrorInfo;
}

export function validate<S, T>(schema: S, data: T) {
  const validator = Joi.object(schema);
  const validatons = validator.validate(data, { abortEarly: false });
  return formatErrors(validatons);
}
