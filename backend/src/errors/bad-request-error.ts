import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  statusCode = 400;

  fieldName = "";
  constructor(public message: string, field = "") {
    super(message);
    this.fieldName = field;
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, field: this.fieldName }];
  }
}
