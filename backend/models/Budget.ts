import mongoose, { Schema, Model } from 'mongoose';
import { BUDGET_STATUS } from '../types/budgetTypes';
import { EXPENSE_CATEGORIES } from '../types/expenseTypes';
import { IBudgetDocument } from '../types/backendBudgetTypes';

const budgetSchema = new Schema<IBudgetDocument>({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    targetAmount: { 
        type: Number, 
        required: true,
        min: [0, 'Target amount must be positive']
    },
    startDate: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(value: any) {
                return new Date(value) <= new Date();
            },
            message: 'Start date cannot be in the future'
        }
    },
    endDate: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(this: any, value: any): boolean {
                // End date should be after start date
                return new Date(value) > new Date(this.startDate);
            },
            message: 'End date must be after start date'
        }
    },
    category: { 
        type: String, 
        required: true,
        enum: Object.values(EXPENSE_CATEGORIES),
        default: 'Other'
    },
    description: { 
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: Object.values(BUDGET_STATUS),
        default: 'Active'
    },
    currentAmount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

budgetSchema.statics.findByUserId = function(userId: string) {
    return this.find({ userId }).sort({ createdAt: -1 });
};

// Define the model interface with static methods
interface IBudgetModel extends Model<IBudgetDocument> {
    findByUserId(userId: string): Promise<IBudgetDocument[]>;
}

// Create and export the model
const Budget: IBudgetModel = mongoose.model<IBudgetDocument, IBudgetModel>('Budget', budgetSchema);

export default Budget;