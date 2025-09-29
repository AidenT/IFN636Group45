import mongoose, { Schema, Model } from 'mongoose';
import { IUser, IUserSafe } from '../types/userTypes';
import bcrypt from 'bcrypt';
import { Country } from '../types/globalTypes';

// Mongoose schema definition
const userSchema = new Schema<IUser>({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    country: { 
        type: String, 
        required: true,
        enum: Object.values(Country) 
    },
    address: { 
        type: String 
    }
}, {
    timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get safe user data (without password)
userSchema.methods.toSafeObject = function(): IUserSafe {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

// Static methods
userSchema.statics.findByEmail = function(email: string) {
    return this.findOne({ email });
};

userSchema.statics.findByEmailExcludePassword = function(email: string) {
    return this.findOne({ email }).select('-password');
};

// Define the model interface with static methods
interface IUserModel extends Model<IUser> {
    findByEmail(email: string): Promise<IUser | null>;
    findByEmailExcludePassword(email: string): Promise<IUser | null>;
}

// Create and export the model
const User: IUserModel = mongoose.model<IUser, IUserModel>('User', userSchema);

// Export the model
export default User;
