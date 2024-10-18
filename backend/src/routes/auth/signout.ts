import express from "express";
import { requireAuth } from "../../middleware";

const router = express.Router();

/**
 * @openapi
 * /auth/signout:
 *   post:
 *     tags:
 *       - Auth
 *     description: Enables users to log out of their account.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successfully logged out from your account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully logged out from your account."
 */

router.post("/auth/signout", requireAuth, (req, res) => {
  req.currentUser = undefined;

  res.clearCookie("token").json({ status: "success", message: "Welcome Back!!" });
});

export { router as SignOutRouter };
