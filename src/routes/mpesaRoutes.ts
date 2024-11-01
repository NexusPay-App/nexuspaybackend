
import { Router } from "express"
import { mpesaDeposit } from "../controllers/mpesaController"
import { authenticateToken } from "../middleware/authMiddleware"

const router = Router()

router.post("/deposit", authenticateToken, mpesaDeposit)

export default router
