import { NextFunction, Request, Response, Router } from "express";
import { initiateSTKPush } from "../services/mpesa";
import config from "../config/env"
import { sendToken } from "../services/token";

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
        console.log("mpesa transaction successful, move on with sending crypto worth ksh: ", amount)
        let convertedAmount = parseInt(amount) / 100
        await sendToken(user.walletAddress, convertedAmount, "celo", config.PLATFORM_WALLET_PRIVATE_KEY)
        return res.json({ message: "swap conducted successfully" })
    } catch (error) {
        next(error)
    }
}

export { router as DepositRouter }