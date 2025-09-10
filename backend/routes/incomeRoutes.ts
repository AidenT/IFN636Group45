import express from 'express';
import { getIncomes, addIncome, updateIncome, deleteIncome, getIncomeById } from '../controllers/incomeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getIncomes);
router.get('/:id', protect, getIncomeById);
router.post('/addIncome', protect, addIncome);
router.put('/:id', protect, updateIncome);
router.delete('/:id', protect, deleteIncome);

export default router;
