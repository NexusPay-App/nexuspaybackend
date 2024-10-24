import { NextFunction, Request, Response, Router } from "express";
import { initiateSTKPush } from "../services/mpesa";
import config from "../config/env"

const router = Router();

export const mpesaDeposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { amount, phone, userId } = req.body
        console.log("phone: ", phone)

        // initiate deposit
        await initiateSTKPush(phone, config.MPESA_SHORTCODE!, amount, "deposit", userId).then((response) => {
            res.status(201).json({
                status: "success",
                message: `STK push successfully initiated`,
            });
        })
    } catch (error) {
        next(error)
    }
}

export { router as DepositRouter }