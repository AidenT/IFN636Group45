import { EXPENSE_CATEGORIES, RECURRING_FREQUENCIES } from '../types/expenseTypes';
import { IExpenseDocument } from '../types/backendExpenseTypes';
import mongoose, { Schema, Model } from 'mongoose';

const expenseSchema = new Schema<IExpenseDocument>({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true,
        min: [0, 'Amount must be positive']
    },
    dateSpent: { 
        type: Date, 
        required: true,
        default: Date.now
    },
    description: { 
        type: String
    },
    category: { 
        type: String, 
        required: true,
        enum: Object.values(EXPENSE_CATEGORIES),
        default: 'Other'
    },
    merchant: { 
        type: String, 
    },
    isRecurring: { 
        type: Boolean, 
        default: false 
    },
    recurringFrequency: { 
        type: String,
        enum: Object.values(RECURRING_FREQUENCIES),
        required: function(this: IExpenseDocument) {
            return this.isRecurring;
        }
    },
    startDate: {
        type: Date,
        required: function(this: IExpenseDocument) {
            return this.isRecurring;
        }
    }
}, {
    timestamps: true
});

// This is the syntax for adding static methods
expenseSchema.statics.findByUserId = function(userId: string) {
    return this.find({ userId }).sort({ dateSpent: -1 });
};

expenseSchema.statics.findRecurringExpenses = function(userId: string) {
    return this.find({ userId, isRecurring: true });
};

expenseSchema.statics.getTotalExpenseForPeriod = function(userId: string, startDate: Date, endDate: Date) {
    return this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                dateSpent: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);
};

// Define the model interface with static methods
interface IExpenseModel extends Model<IExpenseDocument> {
    findByUserId(userId: string): Promise<IExpenseDocument[]>;
    findRecurringExpenses(userId: string): Promise<IExpenseDocument[]>;
    getTotalExpenseForPeriod(userId: string, startDate: Date, endDate: Date): Promise<any[]>;
}

// Create and export the model, to be new'd up in controllers.
const Expense: IExpenseModel = mongoose.model<IExpenseDocument, IExpenseModel>('Expense', expenseSchema);

// Export the model
export default Expense;