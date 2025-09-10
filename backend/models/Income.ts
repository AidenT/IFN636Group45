import mongoose, { Schema, Document, Model } from 'mongoose';

// This is a duplicated const also in frontend/types until PFA-80 (User story 22 can be completed)
export const INCOME_CATEGORIES = {
    SALARY: 'Salary',
    FREELANCE: 'Freelance',
    INVESTMENT: 'Investment',
    BUSINESS: 'Business',
    GIFT: 'Gift',
    OTHER: 'Other'
} as const;

export const RECURRING_FREQUENCIES = {
    WEEKLY: 'Weekly',
    BI_WEEKLY: 'Bi-weekly',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    YEARLY: 'Yearly'
} as const;

// Utility types
export type IncomeCategory = typeof INCOME_CATEGORIES[keyof typeof INCOME_CATEGORIES];
export type RecurringFrequency = typeof RECURRING_FREQUENCIES[keyof typeof RECURRING_FREQUENCIES];

export interface BaseIncome {
    amount: number;
    dateEarned: Date;
    description?: string;
    category: IncomeCategory;
    source?: string;
    isRecurring: boolean;
    recurringFrequency?: RecurringFrequency;
    startDate?: Date;
}

// Mongoose Document interface for Income
export interface IIncome extends Document, BaseIncome {
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const incomeSchema = new Schema<IIncome>({
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
    dateEarned: { 
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
        enum: INCOME_CATEGORIES,
        default: 'Salary'
    },
    source: { 
        type: String, 
    },
    isRecurring: { 
        type: Boolean, 
        default: false 
    },
    recurringFrequency: { 
        type: String,
        enum: RECURRING_FREQUENCIES,
        required: function(this: IIncome) {
            return this.isRecurring;
        }
    },
    startDate: { 
        type: Date,
        required: function(this: IIncome) {
            return this.isRecurring;
        }
    }
}, {
    timestamps: true
});

// This is the syntax for adding custom methods on the class
// incomeSchema.methods.toJSON = function() {
//     const income = this.toObject();
//     return income;
// };

// This is the syntax for adding static methods
incomeSchema.statics.findByUserId = function(userId: string) {
    return this.find({ userId }).sort({ dateEarned: -1 });
};

incomeSchema.statics.findRecurringIncomes = function(userId: string) {
    return this.find({ userId, isRecurring: true });
};

// This can be utilized in the financial dashboard
// incomeSchema.statics.getTotalIncomeForPeriod = function(
//     userId: string, 
//     startDate: Date, 
//     endDate: Date
// ) {
//     return this.aggregate([
//         {
//             $match: {
//                 userId: new mongoose.Types.ObjectId(userId),
//                 dateEarned: { $gte: startDate, $lte: endDate }
//             }
//         },
//         {
//             $group: {
//                 _id: null,
//                 totalAmount: { $sum: '$amount' },
//                 count: { $sum: 1 }
//             }
//         }
//     ]);
// };

// Define the model interface with static methods
interface IIncomeModel extends Model<IIncome> {
    findByUserId(userId: string): Promise<IIncome[]>;
    findRecurringIncomes(userId: string): Promise<IIncome[]>;
    //getTotalIncomeForPeriod(userId: string, startDate: Date, endDate: Date): Promise<any[]>;
}

// Create and export the model, to be new'd up in controllers.
const Income: IIncomeModel = mongoose.model<IIncome, IIncomeModel>('Income', incomeSchema);

// Export the model
export default Income;
