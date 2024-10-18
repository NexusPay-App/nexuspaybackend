import express from 'express';
import { conversionController, getUsdcBalance } from '../controllers/usdcController';

const router = express.Router();

router.get('/usdc-balance/:chain/:address', getUsdcBalance);
router.get('/conversionrate', conversionController);

export { router as UsdcRouter };
