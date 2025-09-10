import express from 'express';
import { getExpenses, getExpenseById, addExpense, deleteExpense, updateExpense } from '../controllers/expenseController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getExpenses);
router.get('/:id', protect, getExpenseById);
router.post('/addExpense', protect, addExpense);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);

export default router;
