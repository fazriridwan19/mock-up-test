using BackendNet.Application.Common;
using BackendNet.Application.DTOs;
using BackendNet.Application.Services;
using BackendNet.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BackendNet.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController(IAuthService auth) : ControllerBase
{
    // POST /api/auth/signup
    [HttpPost("signup")]
    [AllowAnonymous]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest req)
    {
        var user = await auth.SignUpAsync(req);
        return Ok(ApiResponse<UserResponse>.Ok(user, "Registrasi berhasil"));
    }

    // POST /api/auth/login
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var (at, rt, user) = await auth.LoginAsync(req);

        Response.Cookies.Append("access_token", at, CookieHelper.AccessTokenOptions());
        Response.Cookies.Append("refresh_token", rt, CookieHelper.RefreshTokenOptions());

        return Ok(ApiResponse<UserResponse>.Ok(user, "Login berhasil"));
    }

    // POST /api/auth/refresh
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh()
    {
        var rawToken = Request.Cookies["refresh_token"];
        if (string.IsNullOrEmpty(rawToken))
            return Unauthorized(new ApiErrorResponse(false, "Refresh token tidak ditemukan"));

        var (at, rt) = await auth.RefreshAsync(rawToken);

        Response.Cookies.Append("access_token", at, CookieHelper.AccessTokenOptions());
        Response.Cookies.Append("refresh_token", rt, CookieHelper.RefreshTokenOptions());

        return Ok(ApiResponse<object?>.Ok(null, "Token diperbarui"));
    }

    // POST /api/auth/logout
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub")!;

        await auth.LogoutAsync(userId);

        Response.Cookies.Delete("access_token", CookieHelper.ClearOptions());
        Response.Cookies.Delete("refresh_token", new CookieOptions
        {
            HttpOnly = true,
            Path = "/api/auth",
            MaxAge = TimeSpan.Zero,
        });

        return Ok(ApiResponse<object?>.Ok(null, "Berhasil keluar"));
    }

    // GET /api/auth/profile
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub")!;

        var user = await auth.GetProfileAsync(userId);
        return Ok(ApiResponse<UserResponse>.Ok(user, "Profil berhasil diambil"));
    }
}
