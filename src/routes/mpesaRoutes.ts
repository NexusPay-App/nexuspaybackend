
import { Router } from "express"
import { mpesaDeposit, mpesaWithdraw, mpesaB2CWebhook, mpesaQueueWebhook, mpesaSTKPushWebhook } from "../controllers/mpesaController"
import { authenticateToken } from "../middleware/authMiddleware"

const router = Router()

router.post("/deposit", authenticateToken, mpesaDeposit)
router.post("/withdraw", authenticateToken, mpesaWithdraw)
router.post("/b2c/result", mpesaB2CWebhook)
router.post("/stk-push/result", mpesaSTKPushWebhook)
router.post("/queue", mpesaQueueWebhook)

export default router
