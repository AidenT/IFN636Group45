import express from 'express';
import {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget
} from '../controllers/budgetController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getBudgets);
router.post('/', protect, createBudget);
router.put('/:id', protect, updateBudget);
router.delete('/:id', protect, deleteBudget);

export default router;