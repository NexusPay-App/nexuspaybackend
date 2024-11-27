import { NextFunction, Request, Response, Router } from "express";
import { User } from '../models/models';
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
        const user = await User.findOne({ phoneNumber: req.user.phoneNumber });
        if (user == null) {
            return res.status(400).json({ "message": "user null" })
        }
        const amount = req.body.amount
        const receiver = 254708374149

        let conversionRate = await getConversionRateWithCaching();
        let convertedAmount = parseFloat(amount) / conversionRate

        console.log("user: ", req.user)

        await sendToken(config.PLATFORM_WALLET_ADDRESS, convertedAmount, "celo", user.privateKey)

        const serviceAcceptedObj = await initiateB2C(amount, receiver)

        res.json(serviceAcceptedObj)
    } catch (error) {
        next(error)
    }
}

export const mpesaSTKPushWebhook = (req: Request, res: Response) => {
    console.log("-----------------Received MPESA Webhook--------------------")
    // format and dump the request payload recieved from safaricom in the terminal
    console.log(req.body);
    console.log('-----------------------');
    // const amount = req.body["stkCallback"]["CallbackMetadata"]["Item"][0]["Value"]
    // console.log("amount paid: ", amount)

    let message = {
        "ResponseCode": "00000000",
        "ResponseDesc": "success"
    };

    // respond to safaricom servers with a success message
    res.json(message);
}

export const mpesaB2CWebhook = (req: Request, res: Response) => {
    console.log("---------------Safaricom result----------------")
    console.log(req.body)
    console.log("-----------------------------------------")

    const resultParameter: Array<any> = req.body.Result.ResultParameters.ResultParameter

    console.log("result: ", resultParameter)

    const amountSent = resultParameter[0].Value

    console.log("amount sent: ", amountSent)

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