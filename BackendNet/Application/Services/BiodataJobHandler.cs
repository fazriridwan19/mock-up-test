using BackendNet.Application.DTOs;
using BackendNet.Domain;
using BackendNet.Domain.Entities;
using BackendNet.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BackendNet.Application.Services;

public class BiodataJobHandler(AppDbContext db, ILogger<BiodataJobHandler> logger)
{
    // ── Create ────────────────────────────────────────────────────────────────

    public async Task HandleCreateAsync(string userId, BiodataRequest req)
    {
        logger.LogInformation("JOB CREATE: userId={UserId}", userId);

        if (await db.Biodatas.AnyAsync(b => b.UserId == userId))
            throw new InvalidOperationException("Biodata sudah ada");

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var biodata = MapToEntity(req, userId);
            db.Biodatas.Add(biodata);
            await db.SaveChangesAsync();

            await SaveChildrenAsync(biodata.Id, req);
            await tx.CommitAsync();

            logger.LogInformation("JOB CREATE done: biodataId={Id}", biodata.Id);
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public async Task HandleUpdateAsync(string userId, BiodataRequest req)
    {
        logger.LogInformation("JOB UPDATE: userId={UserId}", userId);

        var biodata = await db.Biodatas.FirstOrDefaultAsync(b => b.UserId == userId)
            ?? throw new KeyNotFoundException("Biodata tidak ditemukan");

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            ApplyUpdate(biodata, req);
            await db.SaveChangesAsync();

            await ReplaceChildrenAsync(biodata.Id, req);
            await tx.CommitAsync();

            logger.LogInformation("JOB UPDATE done: biodataId={Id}", biodata.Id);
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public async Task HandleDeleteAsync(string userId)
    {
        logger.LogInformation("JOB DELETE: userId={UserId}", userId);

        var biodata = await db.Biodatas.FirstOrDefaultAsync(b => b.UserId == userId)
            ?? throw new KeyNotFoundException("Biodata tidak ditemukan");

        biodata.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        logger.LogInformation("JOB DELETE done: biodataId={Id}", biodata.Id);
    }

    // ── Admin Update ──────────────────────────────────────────────────────────

    public async Task HandleAdminUpdateAsync(string biodataId, BiodataRequest req)
    {
        logger.LogInformation("JOB ADMIN_UPDATE: biodataId={Id}", biodataId);

        var biodata = await db.Biodatas.FirstOrDefaultAsync(b => b.Id == biodataId)
            ?? throw new KeyNotFoundException($"Biodata {biodataId} tidak ditemukan");

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            ApplyUpdate(biodata, req);
            await db.SaveChangesAsync();

            await ReplaceChildrenAsync(biodataId, req);
            await tx.CommitAsync();

            logger.LogInformation("JOB ADMIN_UPDATE done: biodataId={Id}", biodataId);
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    // ── Admin Delete ──────────────────────────────────────────────────────────

    public async Task HandleAdminDeleteAsync(string biodataId)
    {
        logger.LogInformation("JOB ADMIN_DELETE: biodataId={Id}", biodataId);

        var biodata = await db.Biodatas.IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Id == biodataId)
            ?? throw new KeyNotFoundException($"Biodata {biodataId} tidak ditemukan");

        biodata.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        logger.LogInformation("JOB ADMIN_DELETE done: biodataId={Id}", biodataId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Biodata MapToEntity(BiodataRequest r, string userId) => new()
    {
        Id              = Guid.NewGuid().ToString(),
        UserId          = userId,
        AppliedPosition = r.AppliedPosition,
        FullName        = r.FullName,
        NationalIdNumber = r.NationalIdNumber,
        BirthPlace      = r.BirthPlace,
        BirthDate       = DateOnly.Parse(r.BirthDate),
        Gender          = r.Gender,
        Religion        = r.Religion,
        BloodType       = r.BloodType,
        MaritalStatus   = r.MaritalStatus,
        KtpAddress      = r.KtpAddress,
        CurrentAddress  = r.CurrentAddress,
        Email           = r.Email,
        PhoneNumber     = r.PhoneNumber,
        EmergencyContact = r.EmergencyContact,
        Skills          = r.Skills,
        WillingToBePlaced = r.WillingToBePlaced,
        ExpectedSalary  = r.ExpectedSalary,
    };

    private static void ApplyUpdate(Biodata b, BiodataRequest r)
    {
        b.AppliedPosition = r.AppliedPosition;
        b.FullName        = r.FullName;
        b.NationalIdNumber = r.NationalIdNumber;
        b.BirthPlace      = r.BirthPlace;
        b.BirthDate       = DateOnly.Parse(r.BirthDate);
        b.Gender          = r.Gender;
        b.Religion        = r.Religion;
        b.BloodType       = r.BloodType;
        b.MaritalStatus   = r.MaritalStatus;
        b.KtpAddress      = r.KtpAddress;
        b.CurrentAddress  = r.CurrentAddress;
        b.Email           = r.Email;
        b.PhoneNumber     = r.PhoneNumber;
        b.EmergencyContact = r.EmergencyContact;
        b.Skills          = r.Skills;
        b.WillingToBePlaced = r.WillingToBePlaced;
        b.ExpectedSalary  = r.ExpectedSalary;
        b.UpdatedAt       = DateTime.UtcNow;
    }

    private async Task SaveChildrenAsync(string biodataId, BiodataRequest req)
    {
        if (req.EducationHistories is { Count: > 0 })
        {
            var entities = req.EducationHistories.Select(e => new EducationHistory
            {
                Id          = Guid.NewGuid().ToString(),
                BiodataId   = biodataId,
                Institution = e.Institution,
                Major       = e.Major,
                Degree      = e.Degree,
                StartYear   = e.StartYear,
                EndYear     = e.EndYear,
                Gpa         = e.Gpa,
            });
            await db.EducationHistories.AddRangeAsync(entities);
        }

        if (req.TrainingHistories is { Count: > 0 })
        {
            var entities = req.TrainingHistories.Select(t => new TrainingHistory
            {
                Id          = Guid.NewGuid().ToString(),
                BiodataId   = biodataId,
                Name        = t.Name,
                Organizer   = t.Organizer,
                Year        = t.Year,
                Duration    = t.Duration,
                Certificate = t.Certificate,
            });
            await db.TrainingHistories.AddRangeAsync(entities);
        }

        if (req.EmploymentHistories is { Count: > 0 })
        {
            var entities = req.EmploymentHistories.Select(e => new EmploymentHistory
            {
                Id          = Guid.NewGuid().ToString(),
                BiodataId   = biodataId,
                Company     = e.Company,
                Position    = e.Position,
                StartDate   = DateOnly.Parse(e.StartDate),
                EndDate     = string.IsNullOrEmpty(e.EndDate) ? null : DateOnly.Parse(e.EndDate),
                Salary      = e.Salary,
                Description = e.Description,
            });
            await db.EmploymentHistories.AddRangeAsync(entities);
        }

        await db.SaveChangesAsync();
    }

    private async Task ReplaceChildrenAsync(string biodataId, BiodataRequest req)
    {
        // Soft-delete existing children
        var now = DateTime.UtcNow;

        await db.EducationHistories
            .Where(e => e.BiodataId == biodataId)
            .ExecuteUpdateAsync(s => s.SetProperty(e => e.DeletedAt, now));

        await db.TrainingHistories
            .Where(t => t.BiodataId == biodataId)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.DeletedAt, now));

        await db.EmploymentHistories
            .Where(e => e.BiodataId == biodataId)
            .ExecuteUpdateAsync(s => s.SetProperty(e => e.DeletedAt, now));

        await SaveChildrenAsync(biodataId, req);
    }
}
