
export type ApiSuccessResponse<T> = {
    success: true;
    data: T;
    message?: string;
};

export type ApiErrorResponse = {
    success: false;
    error: string;
    details?: unknown;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export const successResponse = <T>(
    data: T,
    message?: string
): ApiSuccessResponse<T> => ({
    success: true,
    data,
    message,
});

export const errorResponse = (
    error: string,
    details?: unknown
): ApiErrorResponse => ({
    success: false,
    error,
    details,
});