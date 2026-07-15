using BackendNet.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BackendNet.Infrastructure;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Biodata> Biodatas => Set<Biodata>();
    public DbSet<EducationHistory> EducationHistories => Set<EducationHistory>();
    public DbSet<TrainingHistory> TrainingHistories => Set<TrainingHistory>();
    public DbSet<EmploymentHistory> EmploymentHistories => Set<EmploymentHistory>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);

        // ── Users ──────────────────────────────────────────────────────────
        model.Entity<User>(e =>
        {
            e.HasQueryFilter(u => u.DeletedAt == null);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
        });

        // ── Biodata ────────────────────────────────────────────────────────
        model.Entity<Biodata>(e =>
        {
            e.HasQueryFilter(b => b.DeletedAt == null);
            e.HasIndex(b => b.NationalIdNumber).IsUnique();
            e.Property(b => b.Gender).HasConversion<string>();
            e.Property(b => b.Religion).HasConversion<string>();
            e.Property(b => b.BloodType).HasConversion<string>();
            e.Property(b => b.MaritalStatus).HasConversion<string>();

            e.HasOne(b => b.User)
             .WithOne(u => u.Biodata)
             .HasForeignKey<Biodata>(b => b.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(b => b.EducationHistories)
             .WithOne(eh => eh.Biodata)
             .HasForeignKey(eh => eh.BiodataId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(b => b.TrainingHistories)
             .WithOne(th => th.Biodata)
             .HasForeignKey(th => th.BiodataId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(b => b.EmploymentHistories)
             .WithOne(eh => eh.Biodata)
             .HasForeignKey(eh => eh.BiodataId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Education ──────────────────────────────────────────────────────
        model.Entity<EducationHistory>(e =>
        {
            e.HasQueryFilter(eh => eh.DeletedAt == null);
            e.Property(eh => eh.Degree).HasConversion<string>();
        });

        // ── Training ───────────────────────────────────────────────────────
        model.Entity<TrainingHistory>(e =>
        {
            e.HasQueryFilter(th => th.DeletedAt == null);
        });

        // ── Employment ─────────────────────────────────────────────────────
        model.Entity<EmploymentHistory>(e =>
        {
            e.HasQueryFilter(eh => eh.DeletedAt == null);
        });
    }

    // Automatically update UpdatedAt before saving
    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Modified)
            {
                var prop = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "UpdatedAt");
                if (prop is not null) prop.CurrentValue = DateTime.UtcNow;
            }
        }
        return base.SaveChangesAsync(ct);
    }
}
