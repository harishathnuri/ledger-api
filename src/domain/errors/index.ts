export abstract class DomainError extends Error {}

export class ValidationError extends DomainError {
  public errors: ValidationErrorInfo[];

  constructor(errors: ValidationErrorInfo[]) {
    super();
    this.errors = errors;
  }
}

export class ValidationErrorInfo {
  field: Nullable<string>;
  details: ValidationErrorFieldInfo[];

  constructor(field: Nullable<string>, details: ValidationErrorFieldInfo[]) {
    this.field = field;
    this.details = details;
  }
}

export class ValidationErrorFieldInfo {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
