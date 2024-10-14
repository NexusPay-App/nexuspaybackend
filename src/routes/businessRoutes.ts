import express from 'express';
import { registerBusiness } from '../controllers/businessController';

const router = express.Router();

router.post('/', registerBusiness);

export default router;
