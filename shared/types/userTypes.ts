import { Document } from 'mongoose';
import { Country } from './globalTypes';


// TypeScript interface for the User document
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
    country: Country;
}

// TypeScript interface for user without sensitive data (for responses)
export interface IUserSafe {
    _id: string;
    name: string;
    email: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
    country: Country;
}

export interface IAuthenticatedUser extends IUser {
    token: string;
}