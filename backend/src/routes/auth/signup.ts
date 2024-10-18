import { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../../errors/bad-request-error";
import { validateRequest } from "../../middleware";
import { User } from "../../models";
import { formatMpesaNumber, PasswordManager } from "../../utils/utils";

const router = Router();

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags:
 *       - Auth
 *     description: Enables new users to create their account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Phone number
 *                 example: "254712345678"
 *               password:
 *                 type: string
 *                 description: Password
 *                 example: "!Password123"
 *     responses:
 *       200:
 *         description: Successfully created your account. Please login.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully created your account. Please login."
 *       400:
 *         description: Bad request. Invalid input.
 */

router.post(
  "/auth/signup",
  [
    body("phone")
      .notEmpty()
      .isMobilePhone("en-KE")
      .withMessage("Please provide a valid kenyan phone number"),
    body("password")
      .notEmpty()
      .withMessage("please provide your desired password"),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, password } = req.body;
      const formattedPhone = formatMpesaNumber(phone)

      const user = await User.findOne({ phone: formattedPhone });

      if (user) {
        throw new BadRequestError(
          "A user with the same phone number already exists."
        );
      }

      // check password
      if (!PasswordManager.isCorrectFormat(password)) {
        throw new BadRequestError(
          "Your password must be have at least; 8 characters long, 1 special character, 1 uppercase & lowercase characters and a number",
          "password"
        );
      }

      const hashedPassword = await PasswordManager.toHash(password);
      if (!hashedPassword) {
        throw new BadRequestError("Error hashing the password");
      }

      const newUser = new User({ phone: formattedPhone, password: hashedPassword });

      const savedUser = await newUser.save();
      if (!savedUser) {
        throw new BadRequestError("Could not create user ");
      }

      res.status(201).json({
        status: "success",
        user: newUser,
        message: `Successfully created your account`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as SignUpRouter };
