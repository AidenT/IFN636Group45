import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

// TypeScript interface for the User document
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    university?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}

// TypeScript interface for creating new user (without document methods)
export interface IUserCreate {
    name: string;
    email: string;
    password: string;
    university?: string;
    address?: string;
}

// TypeScript interface for user without sensitive data (for responses)
export interface IUserSafe {
    _id: string;
    name: string;
    email: string;
    university?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAuthenticatedUser extends IUser {
    token: string;
}

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
    university: { 
        type: String 
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
