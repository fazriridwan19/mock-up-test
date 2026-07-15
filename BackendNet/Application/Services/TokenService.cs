using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BackendNet.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace BackendNet.Application.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken(User user);
    ClaimsPrincipal? ValidateRefreshToken(string token);
}

public class TokenService(IConfiguration config) : ITokenService
{
    private readonly string _accessSecret  = config["Jwt:AccessSecret"]!;
    private readonly string _refreshSecret = config["Jwt:RefreshSecret"]!;
    private readonly string _accessExpiry  = config["Jwt:AccessExpiresIn"]  ?? "15m";
    private readonly string _refreshExpiry = config["Jwt:RefreshExpiresIn"] ?? "7d";

    public string GenerateAccessToken(User user)
        => BuildToken(user, _accessSecret, ParseExpiry(_accessExpiry));

    public string GenerateRefreshToken(User user)
        => BuildToken(user, _refreshSecret, ParseExpiry(_refreshExpiry));

    public ClaimsPrincipal? ValidateRefreshToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        try
        {
            return handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey        = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_refreshSecret)),
                ValidateIssuer          = false,
                ValidateAudience        = false,
                ClockSkew               = TimeSpan.Zero,
            }, out _);
        }
        catch { return null; }
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private static string BuildToken(User user, string secret, TimeSpan expiry)
    {
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims  = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("role", user.Role.ToString()),
        };

        var token = new JwtSecurityToken(
            claims:   claims,
            expires:  DateTime.UtcNow.Add(expiry),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>Parse "15m", "7d", "1h" → TimeSpan.</summary>
    private static TimeSpan ParseExpiry(string raw)
    {
        if (raw.EndsWith('m') && int.TryParse(raw[..^1], out var mins)) return TimeSpan.FromMinutes(mins);
        if (raw.EndsWith('h') && int.TryParse(raw[..^1], out var hrs))  return TimeSpan.FromHours(hrs);
        if (raw.EndsWith('d') && int.TryParse(raw[..^1], out var days)) return TimeSpan.FromDays(days);
        return TimeSpan.FromMinutes(15); // fallback
    }
}
