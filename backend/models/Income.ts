import mongoose, { Schema, Model } from 'mongoose';
import { INCOME_CATEGORIES, RECURRING_FREQUENCIES, IIncome } from '../types/incomeTypes';

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
