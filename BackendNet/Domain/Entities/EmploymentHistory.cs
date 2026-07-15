using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendNet.Domain.Entities;

[Table("employment_histories")]
public class EmploymentHistory
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("biodata_id")]
    [MaxLength(36)]
    public string BiodataId { get; set; } = string.Empty;

    [Column("company")]
    [MaxLength(255)]
    public string Company { get; set; } = string.Empty;

    [Column("position")]
    [MaxLength(255)]
    public string Position { get; set; } = string.Empty;

    [Column("start_date")]
    public DateOnly StartDate { get; set; }

    [Column("end_date")]
    public DateOnly? EndDate { get; set; }

    [Column("salary", TypeName = "decimal(15,2)")]
    public decimal? Salary { get; set; }

    [Column("description", TypeName = "text")]
    public string? Description { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [ForeignKey("BiodataId")]
    public Biodata? Biodata { get; set; }
}
