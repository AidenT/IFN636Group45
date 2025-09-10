// Auth-related types
export interface UserData {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    password?: string;
    university?: string;
    address?: string;
    createdAt?: Date;
    updatedAt?: Date;
    save?: () => Promise<UserData>;
}

export interface UserResponseData {
    id: string;
    name: string;
    email: string;
    university?: string;
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
    university?: string;
    address?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    university?: string;
    address?: string;
}

// Define interfaces for our middleware
export interface UserPayload {
    id: string;
    iat?: number;
    exp?: number;
}