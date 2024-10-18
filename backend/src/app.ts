
import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';

import { ErrorRequestHandler } from 'express';

import { Verification } from './models/verificationModel';
import cookieParser from 'cookie-parser';
import swaggerDoc from './utils/swagger';

import { NotFoundError } from './errors';
import { errorHandler } from './middleware';
import { PORT } from '.';
import routes from './routes';


const app = express();

// Security middlewares
app.use(helmet());

// CORS middleware for allowing cross-origin requests
// app.use(cors());

// Define allowed origins
const allowedOrigins: string[] = ['http://localhost:3000', 'http://localhost:8000', 'https://nexuspayapp-snowy.vercel.app', 'https://app.nexuspayapp.xyz'];

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

// Session config 
app.use(cookieParser());

// Rate Limiting to prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.post('/api/verifications', async (req, res) => {
    try {
        const { providerId, providerName, phoneNumber, proof, verified } = req.body;
        const verification = new Verification({ providerId, providerName, phoneNumber, proof, verified });
        await verification.save();
        res.status(201).send(verification);
    } catch (error) {
        res.status(400).send(error);
    }
});


// Get all verifications (optional)
app.get('/api/verifications', async (req, res) => {
    try {
        const verifications = await Verification.find();
        res.status(200).send(verifications);
    } catch (error) {
        res.status(500).send(error);
    }
});


// ROUTES 
app.use("/api/v1", routes)
// import "./routes/index";

swaggerDoc(app, PORT as number || 8000)

// Not found Route
app.all("*", async (_req, _res) => {
    throw new NotFoundError();
});

// Error handling
app.use(errorHandler as ErrorRequestHandler);


export { app }