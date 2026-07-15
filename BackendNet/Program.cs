using System.Text;
using BackendNet.Application.Services;
using BackendNet.Infrastructure;
using BackendNet.Infrastructure.Middleware;
using Hangfire;
using Hangfire.Redis.StackExchange;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);
var cfg     = builder.Configuration;

// ── Database ──────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseMySql(
        cfg.GetConnectionString("Default"),
        ServerVersion.AutoDetect(cfg.GetConnectionString("Default")),
        o => o.EnableRetryOnFailure(3)));

// ── Redis ─────────────────────────────────────────────────────────────────────
var redisConn = cfg["Redis:Connection"]!;
var redis     = ConnectionMultiplexer.Connect(redisConn);
builder.Services.AddSingleton<IConnectionMultiplexer>(redis);

// ── Hangfire (Redis-backed async jobs) ────────────────────────────────────────
builder.Services.AddHangfire(hf => hf
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseRedisStorage(redis, new RedisStorageOptions
    {
        Prefix            = "hangfire:",
        SucceededListSize = 200,
        DeletedListSize   = 100,
    }));

builder.Services.AddHangfireServer(opt =>
{
    opt.WorkerCount  = 5;
    opt.Queues       = ["default"];
});

// ── JWT authentication ────────────────────────────────────────────────────────
var accessSecret = cfg["Jwt:AccessSecret"]!;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey        = new SymmetricSecurityKey(
                                        Encoding.UTF8.GetBytes(accessSecret)),
            ValidateIssuer   = false,
            ValidateAudience = false,
            ClockSkew        = TimeSpan.Zero,
        };

        // Read token from httpOnly cookie instead of Authorization header
        opt.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var token = ctx.Request.Cookies["access_token"];
                if (!string.IsNullOrEmpty(token))
                    ctx.Token = token;
                return Task.CompletedTask;
            },
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", p => p.RequireRole("ADMIN"))
    .AddPolicy("UserOnly",  p => p.RequireRole("USER"));

// ── CORS ──────────────────────────────────────────────────────────────────────
var origins = cfg.GetSection("AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(opt => opt.AddDefaultPolicy(p =>
    p.WithOrigins(origins)
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials())); // required for cookie-based auth

// ── Application services ──────────────────────────────────────────────────────
builder.Services.AddScoped<ITokenService,   TokenService>();
builder.Services.AddScoped<IAuthService,    AuthService>();
builder.Services.AddScoped<IBiodataService, BiodataService>();
builder.Services.AddScoped<BiodataJobHandler>();

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services
    .AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
        // Serialize enums as strings
        opt.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// ── Swagger / OpenAPI ─────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(s =>
{
    s.SwaggerDoc("v1", new OpenApiInfo
    {
        Title   = "EDI Biodata API (.NET)",
        Version = "v1",
        Description = "ASP.NET Core 8 port of the EDI Biodata Management API",
    });

    // Cookie auth in Swagger UI
    s.AddSecurityDefinition("cookieAuth", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.ApiKey,
        In   = ParameterLocation.Cookie,
        Name = "access_token",
    });
    s.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "cookieAuth",
                },
            },
            []
        },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
var app = builder.Build();
// ─────────────────────────────────────────────────────────────────────────────

// Run EF migrations on startup (dev-friendly; use proper migration tooling in prod)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

// ── Middleware pipeline ───────────────────────────────────────────────────────
app.UseMiddleware<ExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "EDI Biodata API v1");
    c.RoutePrefix = "api/docs";
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Hangfire dashboard (restrict to localhost in production)
app.UseHangfireDashboard("/api/hangfire", new DashboardOptions
{
    Authorization = [new HangfireLocalAuthFilter()],
});

app.MapControllers();

await app.RunAsync();

// ── Hangfire auth filter ──────────────────────────────────────────────────────
public class HangfireLocalAuthFilter : Hangfire.Dashboard.IDashboardAuthorizationFilter
{
    public bool Authorize(Hangfire.Dashboard.DashboardContext context)
    {
        // In development allow all; in production lock down as needed
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        return env == "Development";
    }
}
