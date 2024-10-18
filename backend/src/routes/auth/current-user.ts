import { NextFunction, Request, Response, Router } from "express";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
import { requireAuth } from "../../middleware";
import { User } from "../../models/user";

const router = Router();

/**
 * @openapi
 * /auth/currentuser:
 *   get:
 *     tags:
 *       - Auth
 *     description: Retrieves the profile information of the currently logged-in user.
 *     responses:
 *       200:
 *         description: Returns a user object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The user's ID.
 *                 phone:
 *                   type: string
 *                   description: The user's phone number.
 *                 username:
 *                   type: string
 *                   description: The user's username
 *                 email:   
 *                   type: string
 *                   description: The user's email
 *                 account_type:
 *                   type: string
 *                   description: The user's account type 
 *                 isActive: 
 *                   type: string
 *                   description: Is the user account active  
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time when the user was created.
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time when the user was last updated.
 */

router.get(
  "/auth/currentuser",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.currentUser?.id);

      if (!user) {
        throw new NotAuthorizedError();
      }
      res.status(200).json({
        status: "success",
        user,
      });

    } catch (error) {
      next(error)
    }
  }
);
export { router as CurrentUserRouter };
