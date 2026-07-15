using System.Net;
using System.Text.Json;
using BackendNet.Application.Common;

namespace BackendNet.Infrastructure.Middleware;

/// <summary>
/// Global exception handler — maps known exception types to HTTP status codes
/// and returns the consistent ApiErrorResponse envelope.
/// </summary>
public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await next(ctx);
        }
        catch (Exception ex)
        {
            await HandleAsync(ctx, ex, logger);
        }
    }

    private static async Task HandleAsync(
        HttpContext ctx, Exception ex, ILogger logger)
    {
        var (status, message) = ex switch
        {
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized,   ex.Message),
            KeyNotFoundException        => (HttpStatusCode.NotFound,       ex.Message),
            InvalidOperationException   => (HttpStatusCode.Conflict,       ex.Message),
            ArgumentException           => (HttpStatusCode.BadRequest,     ex.Message),
            _                           => (HttpStatusCode.InternalServerError, "Internal server error"),
        };

        if (status == HttpStatusCode.InternalServerError)
            logger.LogError(ex, "Unhandled exception");
        else
            logger.LogWarning("{Method} {Path} -> {Status}: {Message}",
                ctx.Request.Method, ctx.Request.Path, (int)status, message);

        ctx.Response.StatusCode  = (int)status;
        ctx.Response.ContentType = "application/json";

        var body = JsonSerializer.Serialize(
            new ApiErrorResponse(false, message), JsonOpts);

        await ctx.Response.WriteAsync(body);
    }
}
