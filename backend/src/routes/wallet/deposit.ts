import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import { formatMpesaNumber } from "../../utils/utils";
import { initiateSTKPush } from "../../utils/mpesa/c2b";
import { MPESA_CONFIG } from "../../utils/mpesa/config";
import { requireAuth, validateRequest } from "../../middleware";

const router = Router();


/**
 * @openapi
 * /wallet/deposit:
 *   post:
 *     tags: 
 *       - Wallet
 *     description: Enables user to deposit to their wallets.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: string
 *                 description: The amount to deposit
 *                 example: "100"
 *     responses:
 *       200:
 *         description: Deposit successfully initiated.
 *         content:
 *           application/json:
 *       400:
 *         description: Bad request. Invalid input.
 *       401:
 *         description: Unauthorized. Incorrect credentials.
 */


router.post(
    "/wallet/deposit", [
    body("amount")
        .notEmpty()
        .withMessage("Provide deposit amount")],
    validateRequest,
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { amount } = req.body

            // initiate deposit
            await initiateSTKPush(req.currentUser.phone, MPESA_CONFIG.shortCode!, amount, "deposit", req.currentUser.id).then((response) => {
                res.status(201).json({
                    status: "success",
                    message: `STK push successfully initiated`,
                });
            })
        } catch (error) {
            next(error)
        }
    }
)

export { router as DepositRouter }