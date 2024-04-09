
import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

import authRoutes from './routes/authRoutes';
import businessRoutes from './routes/businessRoutes';
import tokenRoutes from './routes/tokenRoutes';
import usdcRoutes from './routes/usdcRoutes';
import { connect } from './config/database';

const app = express();
const PORT = 8000;

// Security middlewares
app.use(helmet());

// CORS middleware for allowing cross-origin requests
// app.use(cors());

// Define allowed origins
const allowedOrigins: string[] = ['http://localhost:3000', 'https://nexuspayapp-snowy.vercel.app/onboarding'];

// CORS middleware for allowing cross-origin requests with TypeScript typing
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Body parser middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Compression middleware to compress response bodies
app.use(compression());

// Morgan middleware for logging HTTP requests
app.use(morgan('dev'));

// Rate Limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);


// Route middlewares
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/usdc', usdcRoutes);

// Database connection
connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});


// Global error handling middleware
const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Internal Server Error' });
};

app.use(errorHandler);
