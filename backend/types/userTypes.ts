/**
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY ⚠️
 * 
 * This file was automatically generated from: shared/types/userTypes.ts
 * Generated on: 2025-09-24T01:19:06.881Z
 * 
 * To make changes:
 * 1. Edit the source file: shared/types/userTypes.ts
 * 2. Run: npm run sync-types
 * 
 * Any direct edits to this file will be lost when types are synchronized!
 */

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