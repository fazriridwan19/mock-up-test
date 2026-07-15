using BackendNet.Application.DTOs;
using BackendNet.Domain;
using BackendNet.Domain.Entities;
using BackendNet.Infrastructure;
using Microsoft.EntityFrameworkCore;
using BC = BCrypt.Net.BCrypt;

namespace BackendNet.Application.Services;

public interface IAuthService
{
    Task<UserResponse> SignUpAsync(SignUpRequest req);
    Task<(string AccessToken, string RefreshToken, UserResponse User)> LoginAsync(LoginRequest req);
    Task<(string AccessToken, string RefreshToken)> RefreshAsync(string rawRefreshToken);
    Task LogoutAsync(string userId);
    Task<UserResponse> GetProfileAsync(string userId);
}

public class AuthService(AppDbContext db, ITokenService tokens) : IAuthService
{
    // ── Sign Up ───────────────────────────────────────────────────────────────

    public async Task<UserResponse> SignUpAsync(SignUpRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            throw new InvalidOperationException("Email sudah terdaftar");

        var user = new User
        {
            Id       = Guid.NewGuid().ToString(),
            Email    = req.Email,
            Password = BC.HashPassword(req.Password, workFactor: 12),
            Role     = UserRole.USER,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return new UserResponse(user.Id, user.Email, user.Role.ToString(), user.CreatedAt);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public async Task<(string AccessToken, string RefreshToken, UserResponse User)> LoginAsync(LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email)
            ?? throw new UnauthorizedAccessException("Email atau password salah");

        if (!BC.Verify(req.Password, user.Password))
            throw new UnauthorizedAccessException("Email atau password salah");

        var (at, rt) = await IssueTokensAsync(user);

        return (at, rt, new UserResponse(user.Id, user.Email, user.Role.ToString(), user.CreatedAt));
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    public async Task<(string AccessToken, string RefreshToken)> RefreshAsync(string rawRefreshToken)
    {
        var principal = tokens.ValidateRefreshToken(rawRefreshToken)
            ?? throw new UnauthorizedAccessException("Refresh token tidak valid");

        var userId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                  ?? principal.FindFirst("sub")?.Value
                  ?? throw new UnauthorizedAccessException("Token payload tidak valid");

        var user = await db.Users.FindAsync(userId)
            ?? throw new UnauthorizedAccessException("User tidak ditemukan");

        if (string.IsNullOrEmpty(user.RefreshTokenHash))
            throw new UnauthorizedAccessException("Sesi tidak valid, silakan login kembali");

        // Verify the raw token against the stored hash
        if (!BC.Verify(rawRefreshToken, user.RefreshTokenHash))
        {
            // Token reuse detected — invalidate all sessions
            user.RefreshTokenHash = null;
            await db.SaveChangesAsync();
            throw new UnauthorizedAccessException("Refresh token tidak valid, silakan login kembali");
        }

        var (at, rt) = await IssueTokensAsync(user);
        return (at, rt);
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public async Task LogoutAsync(string userId)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is null) return;

        user.RefreshTokenHash = null;
        await db.SaveChangesAsync();
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    public async Task<UserResponse> GetProfileAsync(string userId)
    {
        var user = await db.Users.FindAsync(userId)
            ?? throw new UnauthorizedAccessException("User tidak ditemukan");

        return new UserResponse(user.Id, user.Email, user.Role.ToString(), user.CreatedAt);
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private async Task<(string At, string Rt)> IssueTokensAsync(User user)
    {
        var accessToken  = tokens.GenerateAccessToken(user);
        var refreshToken = tokens.GenerateRefreshToken(user);

        user.RefreshTokenHash = BC.HashPassword(refreshToken, workFactor: 10);
        await db.SaveChangesAsync();

        return (accessToken, refreshToken);
    }
}
