import express from 'express';
import { conversionController, getUsdcBalance } from '../controllers/usdcController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/usdc-balance/:address', getUsdcBalance);
router.get('/conversionrate', conversionController);

export default router;
