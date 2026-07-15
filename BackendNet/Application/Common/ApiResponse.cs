namespace BackendNet.Application.Common;

/// <summary>Consistent API response envelope matching NestJS backend format.</summary>
public record ApiResponse<T>(bool Success, string Message, T? Data)
{
    public static ApiResponse<T> Ok(T data, string message = "Request successful")
        => new(true, message, data);

    public static ApiResponse<object?> Fail(string message)
        => new ApiResponse<object?>(false, message, null);
}

public record ApiErrorResponse(bool Success, string Message, IEnumerable<string>? Errors = null);
