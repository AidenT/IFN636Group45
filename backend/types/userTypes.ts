/**
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY ⚠️
 * 
 * This file was automatically generated from: shared/types/userTypes.ts
 * Generated on: 2025-10-03T00:35:30.100Z
 * 
 * To make changes:
 * 1. Edit the source file: shared/types/userTypes.ts
 * 2. Run: npm run sync-types
 * 
 * Any direct edits to this file will be lost when types are synchronized!
 */

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