import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import { formatMpesaNumber } from "../../utils/utils";
import { initiateSTKPush } from "../../utils/mpesa/c2b";
import { MPESA_CONFIG } from "../../utils/mpesa/config";
import { requireAuth, validateRequest } from "../../middleware";

const router = Router();


/**
 * @openapi
 * /wallet/withdraw:
 *   post:
 *     tags: 
 *       - Wallet
 *     description: Enables user to withdraw from their wallets.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: string
 *                 description: The amount to withdraw
 *                 example: "100"
 *     responses:
 *       200:
 *         description: Withdraw successfully initiated.
 *         content:
 *           application/json:
 *       400:
 *         description: Bad request. Invalid input.
 *       401:
 *         description: Unauthorized. Incorrect credentials.
 */


router.post(
    "/wallet/withdraw", [
    body("phone")
        .notEmpty()
        .withMessage("Provide withdraw amount")],
    validateRequest,
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { amount } = req.body



            // initiate withdraw

        } catch (error) {
            next(error)
        }
    }
)

export { router as DepositRouter }