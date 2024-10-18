import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../../errors/bad-request-error";
import { config } from "process";
import { validateRequest } from "../../middleware";
import { User } from "../../models";
import { formatMpesaNumber, PasswordManager } from "../../utils/utils";

const router = Router();

/**
 * @openapi
 * /auth/signin:
 *   post:
 *     tags: 
 *       - Auth
 *     description: Enables user to be authenticated and authorized.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Phone number of the user
 *                 example: "254712345678"
 *               password:
 *                 type: string
 *                 description: Password of the user
 *                 example: "!Password123"
 *     responses:
 *       200:
 *         description: Successfully logged in to your account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5..."
 *       400:
 *         description: Bad request. Invalid input.
 *       401:
 *         description: Unauthorized. Incorrect credentials.
 */

router.post(
  "/auth/signin",
  [
    body("phone")
      .notEmpty().isMobilePhone("en-KE")
      .withMessage("please provide valid phone number"),
    body("password").notEmpty().withMessage("please provide your password"),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, password } = req.body;
      const formattedPhone = formatMpesaNumber(phone)

      const user = await User.findOne({ phone: formattedPhone });

      if (!user) {
        throw new BadRequestError(`Wrong credentials. Please try again`);
      }

      const passwordMatch = await PasswordManager.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        throw new BadRequestError(`Wrong credentials. Please try again`);
      }

      // generate token
      const token = jwt.sign({
        username: user.username,
        id: user.id,
        phone: user.phone,
        email: user.email,
        userType: user.userType,
        isActive: user.isActive
      },
        process.env.SECRET_KEY || "ZeroZero", // REVIEW: get rid of the key place holder
        { expiresIn: '1h' }
      );

      // allow cookie session
      req.session = {
        token,
      };

      res.status(200).json({
        status: "success",
        user,
        token: token,
        message: `Successfully signed in to your account`,
      });

    } catch (error) {
      next(error)
    }
  }
);

export { router as SignInRouter };
