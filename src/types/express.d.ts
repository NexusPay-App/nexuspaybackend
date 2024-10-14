// // express.d.ts
// import { Request } from 'express';

// declare module 'express' {
//   export interface Request {
//     user?: {
//       phoneNumber: string;
//       walletAddress: string;
//     }
//   }
// }

// types.d.ts or customTypes.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Define the type according to what you store in user
    }
  }
}
