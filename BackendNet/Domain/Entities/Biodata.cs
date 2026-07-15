using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendNet.Domain.Entities;

[Table("biodata")]
public class Biodata
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("user_id")]
    [MaxLength(36)]
    public string UserId { get; set; } = string.Empty;

    [Column("applied_position")]
    [MaxLength(255)]
    public string AppliedPosition { get; set; } = string.Empty;

    [Column("full_name")]
    [MaxLength(255)]
    public string FullName { get; set; } = string.Empty;

    [Column("national_id_number")]
    [MaxLength(16)]
    public string NationalIdNumber { get; set; } = string.Empty;

    [Column("birth_place")]
    [MaxLength(255)]
    public string BirthPlace { get; set; } = string.Empty;

    [Column("birth_date")]
    public DateOnly BirthDate { get; set; }

    [Column("gender")]
    public Gender Gender { get; set; }

    [Column("religion")]
    public Religion Religion { get; set; }

    [Column("blood_type")]
    public BloodType? BloodType { get; set; }

    [Column("marital_status")]
    public MaritalStatus MaritalStatus { get; set; }

    [Column("ktp_address", TypeName = "text")]
    public string KtpAddress { get; set; } = string.Empty;

    [Column("current_address", TypeName = "text")]
    public string CurrentAddress { get; set; } = string.Empty;

    [Column("email")]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Column("phone_number")]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Column("emergency_contact")]
    [MaxLength(20)]
    public string EmergencyContact { get; set; } = string.Empty;

    [Column("skills", TypeName = "text")]
    public string? Skills { get; set; }

    [Column("willing_to_be_placed")]
    public bool WillingToBePlaced { get; set; } = false;

    [Column("expected_salary", TypeName = "decimal(15,2)")]
    public decimal ExpectedSalary { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }

    public ICollection<EducationHistory> EducationHistories { get; set; } = [];
    public ICollection<TrainingHistory> TrainingHistories { get; set; } = [];
    public ICollection<EmploymentHistory> EmploymentHistories { get; set; } = [];
}
