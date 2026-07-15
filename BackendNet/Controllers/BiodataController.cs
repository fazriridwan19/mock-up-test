using BackendNet.Application.Common;
using BackendNet.Application.DTOs;
using BackendNet.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BackendNet.Controllers;

[ApiController]
[Route("api/biodata")]
[Authorize]
[Produces("application/json")]
public class BiodataController(IBiodataService svc) : ControllerBase
{
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
                          ?? User.FindFirstValue("sub")!;

    // GET /api/biodata
    [HttpGet]
    public async Task<IActionResult> GetMyBiodata()
    {
        var data = await svc.GetMyBiodataAsync(UserId);
        return Ok(ApiResponse<BiodataResponse>.Ok(data, "Biodata berhasil diambil"));
    }

    // GET /api/biodata/jobs/:jobId
    [HttpGet("jobs/{jobId}")]
    public async Task<IActionResult> GetJobStatus(string jobId)
    {
        var data = await svc.GetJobStatusAsync(jobId);
        return Ok(ApiResponse<JobStatusResponse>.Ok(data, "Status job berhasil diambil"));
    }

    // POST /api/biodata  — returns 202 Accepted + jobId
    [HttpPost]
    [Authorize(Roles = "USER")]
    [ProducesResponseType<int>(StatusCodes.Status200OK)]
    public IActionResult CreateBiodata([FromBody] BiodataRequest req)
    {
        var jobId = svc.EnqueueCreate(UserId, req);
        return Accepted(ApiResponse<JobEnqueuedResponse>.Ok(
            new JobEnqueuedResponse(jobId),
            "Permintaan pembuatan biodata sedang diproses"));
    }

    // PUT /api/biodata
    [HttpPut]
    [Authorize(Roles = "USER")]
    [ProducesResponseType<int>(StatusCodes.Status200OK)]
    public IActionResult UpdateBiodata([FromBody] BiodataRequest req)
    {
        var jobId = svc.EnqueueUpdate(UserId, req);
        return Accepted(ApiResponse<JobEnqueuedResponse>.Ok(
            new JobEnqueuedResponse(jobId),
            "Permintaan perubahan biodata sedang diproses"));
    }

    // DELETE /api/biodata
    [HttpDelete]
    [Authorize(Roles = "USER")]
    [ProducesResponseType<int>(StatusCodes.Status200OK)]
    public IActionResult DeleteBiodata()
    {
        var jobId = svc.EnqueueDelete(UserId);
        return Accepted(ApiResponse<JobEnqueuedResponse>.Ok(
            new JobEnqueuedResponse(jobId),
            "Permintaan penghapusan biodata sedang diproses"));
    }
}
