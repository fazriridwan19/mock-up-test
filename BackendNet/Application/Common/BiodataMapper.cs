using BackendNet.Application.DTOs;
using BackendNet.Domain.Entities;

namespace BackendNet.Application.Common;

public static class BiodataMapper
{
    public static BiodataResponse ToResponse(Biodata b) => new(
        b.Id,
        b.UserId,
        b.AppliedPosition,
        b.FullName,
        b.NationalIdNumber,
        b.BirthPlace,
        b.BirthDate.ToString("yyyy-MM-dd"),
        b.Gender.ToString(),
        b.Religion.ToString(),
        b.BloodType?.ToString(),
        b.MaritalStatus.ToString(),
        b.KtpAddress,
        b.CurrentAddress,
        b.Email,
        b.PhoneNumber,
        b.EmergencyContact,
        b.Skills,
        b.WillingToBePlaced,
        b.ExpectedSalary,
        b.EducationHistories.Select(e => new EducationHistoryResponse(
            e.Id, e.Institution, e.Major, e.Degree.ToString(),
            e.StartYear, e.EndYear, e.Gpa)).ToList(),
        b.TrainingHistories.Select(t => new TrainingHistoryResponse(
            t.Id, t.Name, t.Organizer, t.Year, t.Duration, t.Certificate)).ToList(),
        b.EmploymentHistories.Select(e => new EmploymentHistoryResponse(
            e.Id, e.Company, e.Position,
            e.StartDate.ToString("yyyy-MM-dd"),
            e.EndDate?.ToString("yyyy-MM-dd"),
            e.Salary, e.Description)).ToList(),
        b.CreatedAt,
        b.UpdatedAt
    );

    public static UserResponse ToUserResponse(User u) => new(
        u.Id, u.Email, u.Role.ToString(), u.CreatedAt
    );
}
