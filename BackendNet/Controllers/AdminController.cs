using BackendNet.Application.Common;
using BackendNet.Application.DTOs;
using BackendNet.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackendNet.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "ADMIN")]
[Produces("application/json")]
public class AdminController(IBiodataService svc) : ControllerBase
{
    // GET /api/admin/biodata
    [HttpGet("biodata")]
    public async Task<IActionResult> GetAllBiodata(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? appliedPosition = null,
        [FromQuery] string? latestEducation = null)
    {
        var (data, meta) = await svc.GetAdminBiodataListAsync(
            page, limit, search, appliedPosition, latestEducation);

        // Return with meta at top level (matching NestJS response shape)
        return Ok(new
        {
            success = true,
            message = "Data biodata berhasil diambil",
            data,
            meta,
        });
    }

    // GET /api/admin/biodata/:id
    [HttpGet("biodata/{id}")]
    public async Task<IActionResult> GetBiodataById(string id)
    {
        var data = await svc.GetAdminBiodataByIdAsync(id);
        if (data is null) return NotFound(new ApiErrorResponse(false, "Biodata tidak ditemukan"));
        return Ok(ApiResponse<BiodataResponse>.Ok(data, "Detail biodata berhasil diambil"));
    }

    // GET /api/admin/jobs/:jobId
    [HttpGet("jobs/{jobId}")]
    public async Task<IActionResult> GetJobStatus(string jobId)
    {
        var data = await svc.GetJobStatusAsync(jobId);
        return Ok(ApiResponse<JobStatusResponse>.Ok(data, "Status job berhasil diambil"));
    }

    // PUT /api/admin/biodata/:id  — returns 202
    [HttpPut("biodata/{id}")]
    public IActionResult UpdateBiodata(string id, [FromBody] BiodataRequest req)
    {
        var jobId = svc.EnqueueAdminUpdate(id, req);
        return Accepted(ApiResponse<JobEnqueuedResponse>.Ok(
            new JobEnqueuedResponse(jobId),
            "Permintaan perubahan biodata sedang diproses"));
    }

    // DELETE /api/admin/biodata/:id  — returns 202
    [HttpDelete("biodata/{id}")]
    public IActionResult DeleteBiodata(string id)
    {
        var jobId = svc.EnqueueAdminDelete(id);
        return Accepted(ApiResponse<JobEnqueuedResponse>.Ok(
            new JobEnqueuedResponse(jobId),
            "Permintaan penghapusan biodata sedang diproses"));
    }
}
