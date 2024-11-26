import { NextFunction, Request, Response, Router } from "express";
import { initiateB2C, initiateSTKPush } from "../services/mpesa";
import config from "../config/env"
import { getConversionRateWithCaching, sendToken } from "../services/token";

const router = Router();

export const mpesaDeposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { amount, phone, userId } = req.body
        const user = req.user

        console.log("phone: ", phone)

        // initiate deposit
        const queryData = await initiateSTKPush(phone, config.MPESA_SHORTCODE!, amount, "deposit", userId)
        if (!queryData || queryData.ResultCode != "0") {
            return res.status(400).json({ message: "MPESA transaction unsuccessful" })
        }

        let conversionRate = await getConversionRateWithCaching();
        let convertedAmount = parseFloat(amount) / conversionRate
        await sendToken(user.walletAddress, convertedAmount, "celo", config.PLATFORM_WALLET_PRIVATE_KEY)
        return res.json({ message: "swap conducted successfully" })
    } catch (error) {
        next(error)
    }
}

export const mpesaWithdraw = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const amount = req.body.amount
        const receiver = 254708374149

        const serviceAcceptedObj = await initiateB2C(amount, receiver)

        res.json(serviceAcceptedObj)
    } catch (error) {
        next(error)
    }
}

export const mpesaResultWebhook = (req: Request, res: Response) => {
    console.log("---------------Safaricom result----------------")
    console.log(req.body)
    console.log("-----------------------------------------")

    return res.json(req.body)
}

export const mpesaQueueWebhook = (req: Request, res: Response) => {
    console.log("---------------Queue timeout-------------")
    console.log(req.body)
    console.log("-----------------------------------------")

    let message = {
        "Timeout": true
    }
    res.json(message)
}

export { router as DepositRouter }