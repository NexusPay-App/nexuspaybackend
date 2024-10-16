import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Define the type according to what you store in user
    }
  }
}
