using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendNet.Domain.Entities;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("email")]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Column("password")]
    [MaxLength(255)]
    public string Password { get; set; } = string.Empty;

    [Column("role")]
    public UserRole Role { get; set; } = UserRole.USER;

    [Column("refresh_token_hash")]
    [MaxLength(255)]
    public string? RefreshTokenHash { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    // Navigation
    public Biodata? Biodata { get; set; }
}
