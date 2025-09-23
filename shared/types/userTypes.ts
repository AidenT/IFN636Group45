import { Document } from 'mongoose';


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