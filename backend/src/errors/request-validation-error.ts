import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super("Invalid request parameters");

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  private isFieldError(err: ValidationError): err is ValidationError & { param: string } {
    return (err as ValidationError & { param: string }).param !== undefined;
  }

  serializeErrors() {
    return this.errors.map((err) => {
      if (this.isFieldError(err)) {
        return { message: err.msg, field: err.param };
      } else {
        return { message: err.msg };
      }
    });
  }
}
