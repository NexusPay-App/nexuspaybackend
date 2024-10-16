import express from 'express';
import { send, pay, tokenTransferEvents } from '../controllers/tokenController';

const router = express.Router();

router.post('/sendToken', send);
router.post('/pay', pay);
router.get('/token-transfer-events', tokenTransferEvents);

export default router;
