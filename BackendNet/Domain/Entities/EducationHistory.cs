using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendNet.Domain.Entities;

[Table("education_histories")]
public class EducationHistory
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("biodata_id")]
    [MaxLength(36)]
    public string BiodataId { get; set; } = string.Empty;

    [Column("institution")]
    [MaxLength(255)]
    public string Institution { get; set; } = string.Empty;

    [Column("major")]
    [MaxLength(255)]
    public string Major { get; set; } = string.Empty;

    [Column("degree")]
    public Degree Degree { get; set; }

    [Column("start_year")]
    public int StartYear { get; set; }

    [Column("end_year")]
    public int? EndYear { get; set; }

    [Column("gpa", TypeName = "decimal(4,2)")]
    public decimal? Gpa { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [ForeignKey("BiodataId")]
    public Biodata? Biodata { get; set; }
}
