
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


declare global {
    namespace Express {
        interface Request {
            currentUser?: any; // Define the type according to what you store in user
            session?: any
        }
    }
}

const JWT_SECRET = process.env.SECRET_KEY || 'zero';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    let token: any;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    const accessToken = req.session?.token || token;

    if (!accessToken) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.log("error ", err)
            // Provide more specific messages based on the type of error
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: "Invalid token" });
            } else if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Token expired" });
            } else {
                return res.status(403).json({ message: "Unauthorized access" });
            }
        }
        req.currentUser = user;
        next();
    });
};
