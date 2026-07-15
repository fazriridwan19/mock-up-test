namespace BackendNet.Infrastructure;

public static class CookieHelper
{
    private static bool IsProd => Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Production";

    public static CookieOptions AccessTokenOptions() => new()
    {
        HttpOnly = true,
        Secure   = IsProd,
        SameSite = IsProd ? SameSiteMode.Strict : SameSiteMode.Lax,
        Path     = "/",
        MaxAge   = TimeSpan.FromMinutes(15),
    };

    public static CookieOptions RefreshTokenOptions() => new()
    {
        HttpOnly = true,
        Secure   = IsProd,
        SameSite = IsProd ? SameSiteMode.Strict : SameSiteMode.Lax,
        Path     = "/api/auth",   // scope refresh cookie to auth endpoints only
        MaxAge   = TimeSpan.FromDays(7),
    };

    public static CookieOptions ClearOptions() => new()
    {
        HttpOnly = true,
        Secure   = IsProd,
        SameSite = IsProd ? SameSiteMode.Strict : SameSiteMode.Lax,
        Path     = "/",
        MaxAge   = TimeSpan.Zero,
    };
}
