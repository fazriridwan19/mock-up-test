using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendNet.Domain.Entities;

[Table("training_histories")]
public class TrainingHistory
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("biodata_id")]
    [MaxLength(36)]
    public string BiodataId { get; set; } = string.Empty;

    [Column("name")]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Column("organizer")]
    [MaxLength(255)]
    public string Organizer { get; set; } = string.Empty;

    [Column("year")]
    public int Year { get; set; }

    [Column("duration")]
    [MaxLength(100)]
    public string? Duration { get; set; }

    [Column("certificate")]
    [MaxLength(255)]
    public string? Certificate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("deleted_at")]
    public DateTime? DeletedAt { get; set; }

    [ForeignKey("BiodataId")]
    public Biodata? Biodata { get; set; }
}
