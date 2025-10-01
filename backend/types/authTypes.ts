/**
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY ⚠️
 * 
 * This file was automatically generated from: shared/types/authTypes.ts
 * Generated on: 2025-10-01T01:15:08.350Z
 * 
 * To make changes:
 * 1. Edit the source file: shared/types/authTypes.ts
 * 2. Run: npm run sync-types
 * 
 * Any direct edits to this file will be lost when types are synchronized!
 */

// @Shared
// Auth-related types - Used by both frontend and backend
import { Country } from './globalTypes';

export interface UserData {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    password?: string;
    address?: string;
    country?: Country;
    createdAt?: Date;
    updatedAt?: Date;
    save?: () => Promise<UserData>;
}

export interface UserResponseData {
    id: string;
    name: string;
    email: string;
    country?: Country;
    address?: string;
    token: string;
}

// Express request/response types
export interface AuthenticatedRequest {
    body: any;
    params: {
        id: string;
        [key: string]: string;
    };
    user?: UserData;
    headers: {
        authorization?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

export interface ExpressResponse {
    status: (code: number) => ExpressResponse;
    json: (data: any) => void;
}

// Auth-specific request types
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    country: Country;
    address?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    country?: Country;
    address?: string;
}

// Define interfaces for our middleware
export interface UserPayload {
    id: string;
    iat?: number;
    exp?: number;
}