using System.ComponentModel.DataAnnotations;

namespace BackendNet.Application.DTOs;

public record SignUpRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record UserResponse(
    string Id,
    string Email,
    string Role,
    DateTime CreatedAt
);
