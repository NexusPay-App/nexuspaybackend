
import { Router } from "express"
import { mpesaDeposit } from "../controllers/mpesaController"

const router = Router()

router.post("/deposit", mpesaDeposit)

export default router
