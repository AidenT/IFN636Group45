// @Shared
import { Country } from './globalTypes';

// Base interface for user data
export interface BaseUser {
    name: string;
    email: string;
    address?: string;
    country: Country;
}

// Frontend interface for User (clean interface for client-side)
export interface IUser extends BaseUser {
    _id: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// Frontend interface for user without sensitive data (for API responses)
export interface IUserSafe extends BaseUser {
    _id: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// Frontend interface for authenticated user with token
export interface IAuthenticatedUser extends IUser {
    token: string;
}