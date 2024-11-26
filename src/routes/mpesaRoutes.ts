
import { Router } from "express"
import { mpesaDeposit, mpesaWithdraw, mpesaResultWebhook, mpesaQueueWebhook } from "../controllers/mpesaController"
import { authenticateToken } from "../middleware/authMiddleware"

const router = Router()

router.post("/deposit", authenticateToken, mpesaDeposit)
router.post("/withdraw", authenticateToken, mpesaWithdraw)
router.post("/result", mpesaResultWebhook)
router.post("/queue", mpesaQueueWebhook)

export default router
