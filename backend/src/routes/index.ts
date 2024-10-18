import { CurrentUserRouter, SignInRouter, SignOutRouter, SignUpRouter } from "./auth"
import { AuthRouter } from "./authRoutes"
import { BusinessRouter } from "./businessRoutes"
import { TokenRouter } from "./tokenRoutes"
import { UsdcRouter } from "./usdcRoutes"
import { DepositRouter } from "./wallet"
import { MpesaCallbackRouter } from "./mpesa"
import { Router } from 'express';

const router = Router();

router.use(SignInRouter);
router.use(SignOutRouter);
router.use(CurrentUserRouter);
router.use(SignUpRouter);

router.use(DepositRouter)

router.use(MpesaCallbackRouter)

export default router;