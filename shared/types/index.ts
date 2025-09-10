// API Response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface ApiError {
    message: string;
    status: number;
}

// Form validation types
export interface ValidationError {
    field: string;
    message: string;
}