using BackendNet.Application.Common;
using BackendNet.Application.DTOs;
using BackendNet.Domain;
using BackendNet.Domain.Entities;
using BackendNet.Infrastructure;
using Hangfire;
using Microsoft.EntityFrameworkCore;

namespace BackendNet.Application.Services;

public interface IBiodataService
{
    Task<BiodataResponse> GetMyBiodataAsync(string userId);
    Task<BiodataResponse?> GetAdminBiodataByIdAsync(string id);
    Task<(List<BiodataResponse> Data, PageMeta Meta)> GetAdminBiodataListAsync(
        int page, int limit, string? search, string? appliedPosition, string? latestEducation);

    string EnqueueCreate(string userId, BiodataRequest req);
    string EnqueueUpdate(string userId, BiodataRequest req);
    string EnqueueDelete(string userId);
    string EnqueueAdminUpdate(string biodataId, BiodataRequest req);
    string EnqueueAdminDelete(string biodataId);

    Task<JobStatusResponse> GetJobStatusAsync(string jobId);}

public class BiodataService(AppDbContext db, IBackgroundJobClient jobs) : IBiodataService
{
    // ── Reads (synchronous) ───────────────────────────────────────────────────

    public async Task<BiodataResponse> GetMyBiodataAsync(string userId)
    {
        var b = await LoadBiodataByUserAsync(userId)
            ?? throw new KeyNotFoundException("Biodata belum dibuat");
        return BiodataMapper.ToResponse(b);
    }

    public async Task<BiodataResponse?> GetAdminBiodataByIdAsync(string id)
    {
        var b = await LoadBiodataByIdAsync(id);
        return b is null ? null : BiodataMapper.ToResponse(b);
    }

    public async Task<(List<BiodataResponse> Data, PageMeta Meta)> GetAdminBiodataListAsync(
        int page, int limit, string? search, string? appliedPosition, string? latestEducation)
    {
        var query = db.Biodatas
            .Include(b => b.EducationHistories)
            .Include(b => b.TrainingHistories)
            .Include(b => b.EmploymentHistories)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(b => b.FullName.Contains(search));

        if (!string.IsNullOrWhiteSpace(appliedPosition))
            query = query.Where(b => b.AppliedPosition.Contains(appliedPosition));

        if (!string.IsNullOrWhiteSpace(latestEducation) && Enum.TryParse<Degree>(latestEducation, true, out var deg))
            query = query.Where(b => b.EducationHistories.Any(e => e.Degree == deg));

        var total = await query.CountAsync();
        var data  = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        var meta = new PageMeta(total, page, limit, (int)Math.Ceiling((double)total / limit));
        return (data.Select(BiodataMapper.ToResponse).ToList(), meta);
    }

    // ── Mutations (enqueue) ───────────────────────────────────────────────────

    public string EnqueueCreate(string userId, BiodataRequest req)
        => jobs.Enqueue<BiodataJobHandler>(h => h.HandleCreateAsync(userId, req));

    public string EnqueueUpdate(string userId, BiodataRequest req)
        => jobs.Enqueue<BiodataJobHandler>(h => h.HandleUpdateAsync(userId, req));

    public string EnqueueDelete(string userId)
        => jobs.Enqueue<BiodataJobHandler>(h => h.HandleDeleteAsync(userId));

    public string EnqueueAdminUpdate(string biodataId, BiodataRequest req)
        => jobs.Enqueue<BiodataJobHandler>(h => h.HandleAdminUpdateAsync(biodataId, req));

    public string EnqueueAdminDelete(string biodataId)
        => jobs.Enqueue<BiodataJobHandler>(h => h.HandleAdminDeleteAsync(biodataId));

    // ── Job status ────────────────────────────────────────────────────────────

    public Task<JobStatusResponse> GetJobStatusAsync(string jobId)
    {
        // Hangfire stores jobs in Redis; we read via the monitoring API
        var monApi = JobStorage.Current.GetMonitoringApi();

        var succeeded = monApi.SucceededJobs(0, int.MaxValue)
            .FirstOrDefault(j => j.Key == jobId);
        if (succeeded.Key is not null)
            return Task.FromResult(new JobStatusResponse(jobId, "completed", 100, succeeded.Value?.Result, null));

        var failed = monApi.FailedJobs(0, int.MaxValue)
            .FirstOrDefault(j => j.Key == jobId);
        if (failed.Key is not null)
            return Task.FromResult(new JobStatusResponse(jobId, "failed", 0, null, failed.Value?.ExceptionMessage));

        var processing = monApi.ProcessingJobs(0, int.MaxValue)
            .FirstOrDefault(j => j.Key == jobId);
        if (processing.Key is not null)
            return Task.FromResult(new JobStatusResponse(jobId, "active", 0, null, null));

        var enqueued = monApi.EnqueuedJobs("default", 0, int.MaxValue)
            .FirstOrDefault(j => j.Key == jobId);
        if (enqueued.Key is not null)
            return Task.FromResult(new JobStatusResponse(jobId, "waiting", 0, null, null));

        throw new KeyNotFoundException($"Job {jobId} tidak ditemukan");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Task<Biodata?> LoadBiodataByUserAsync(string userId) =>
        db.Biodatas
          .Include(b => b.EducationHistories)
          .Include(b => b.TrainingHistories)
          .Include(b => b.EmploymentHistories)
          .FirstOrDefaultAsync(b => b.UserId == userId);

    private Task<Biodata?> LoadBiodataByIdAsync(string id) =>
        db.Biodatas
          .Include(b => b.EducationHistories)
          .Include(b => b.TrainingHistories)
          .Include(b => b.EmploymentHistories)
          .FirstOrDefaultAsync(b => b.Id == id);
}

// ── Job status DTO ────────────────────────────────────────────────────────────

public record JobStatusResponse(
    string Id,
    string State,
    int Progress,
    object? Result,
    string? Error
);
