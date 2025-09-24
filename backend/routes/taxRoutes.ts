import express from 'express';
import { getTax } from '../controllers/taxController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getTax);

export default router;
