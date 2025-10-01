import mongoose, { Document, Model } from 'mongoose';
import { Country } from '../types/globalTypes';

// Backend Mongoose Document interface for User
export interface IUserDocument extends Document {
    name: string;
    email: string;
    password: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
    country: Country;
    toSafeObject(): IUserSafeDocument;
}

// Backend interface for user without sensitive data (for responses from backend)
export interface IUserSafeDocument {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
    country: Country;
}

// Backend interface for authenticated user with token
export interface IAuthenticatedUserDocument extends IUserDocument {
    token: string;
}