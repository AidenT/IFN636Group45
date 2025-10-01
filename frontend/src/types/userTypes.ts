/**
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY ⚠️
 * 
 * This file was automatically generated from: shared/types/userTypes.ts
 * Generated on: 2025-10-01T01:15:08.355Z
 * 
 * To make changes:
 * 1. Edit the source file: shared/types/userTypes.ts
 * 2. Run: npm run sync-types
 * 
 * Any direct edits to this file will be lost when types are synchronized!
 */

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