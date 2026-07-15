using System.ComponentModel.DataAnnotations;
using BackendNet.Domain;

namespace BackendNet.Application.DTOs;

// ── Child DTOs ────────────────────────────────────────────────────────────────

public record EducationHistoryRequest(
    [Required, MinLength(2)] string Institution,
    [Required, MinLength(2)] string Major,
    [Required] Degree Degree,
    [Required, Range(1950, 2100)] int StartYear,
    [Range(1950, 2100)] int? EndYear,
    [Range(0, 4)] decimal? Gpa
);

public record TrainingHistoryRequest(
    [Required, MinLength(2)] string Name,
    [Required, MinLength(2)] string Organizer,
    [Required, Range(1950, 2100)] int Year,
    string? Duration,
    string? Certificate
);

public record EmploymentHistoryRequest(
    [Required, MinLength(2)] string Company,
    [Required, MinLength(2)] string Position,
    [Required] string StartDate,   // ISO date string: yyyy-MM-dd
    string? EndDate,               // nullable — still working
    [Range(0, double.MaxValue)] decimal? Salary,
    string? Description
);

// ── Biodata Request ───────────────────────────────────────────────────────────

public record BiodataRequest(
    [Required, MinLength(2)] string AppliedPosition,
    [Required, MinLength(2)] string FullName,
    [Required, StringLength(16, MinimumLength = 16, ErrorMessage = "NIK harus 16 digit")] string NationalIdNumber,
    [Required, MinLength(2)] string BirthPlace,
    [Required] string BirthDate,
    [Required] Gender Gender,
    [Required] Religion Religion,
    BloodType? BloodType,
    [Required] MaritalStatus MaritalStatus,
    [Required, MinLength(10)] string KtpAddress,
    [Required, MinLength(10)] string CurrentAddress,
    [Required, EmailAddress] string Email,
    [Required, StringLength(15, MinimumLength = 9)] string PhoneNumber,
    [Required, StringLength(15, MinimumLength = 9)] string EmergencyContact,
    string? Skills,
    bool WillingToBePlaced,
    [Range(0, double.MaxValue)] decimal ExpectedSalary,
    List<EducationHistoryRequest>? EducationHistories,
    List<TrainingHistoryRequest>? TrainingHistories,
    List<EmploymentHistoryRequest>? EmploymentHistories
);

// ── Biodata Response ──────────────────────────────────────────────────────────

public record EducationHistoryResponse(
    string Id, string Institution, string Major, string Degree,
    int StartYear, int? EndYear, decimal? Gpa
);

public record TrainingHistoryResponse(
    string Id, string Name, string Organizer, int Year,
    string? Duration, string? Certificate
);

public record EmploymentHistoryResponse(
    string Id, string Company, string Position,
    string StartDate, string? EndDate,
    decimal? Salary, string? Description
);

public record BiodataResponse(
    string Id,
    string UserId,
    string AppliedPosition,
    string FullName,
    string NationalIdNumber,
    string BirthPlace,
    string BirthDate,
    string Gender,
    string Religion,
    string? BloodType,
    string MaritalStatus,
    string KtpAddress,
    string CurrentAddress,
    string Email,
    string PhoneNumber,
    string EmergencyContact,
    string? Skills,
    bool WillingToBePlaced,
    decimal ExpectedSalary,
    List<EducationHistoryResponse> EducationHistories,
    List<TrainingHistoryResponse> TrainingHistories,
    List<EmploymentHistoryResponse> EmploymentHistories,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

// ── Job / Pagination ──────────────────────────────────────────────────────────

public record JobEnqueuedResponse(string JobId);

public record PageMeta(int Total, int Page, int Limit, int TotalPages);

public record PaginatedBiodataResponse(
    List<BiodataResponse> Data,
    PageMeta Meta
);
