# Biodata Management System

A full-stack web application for managing employee biodata, built with NestJS, React, MySQL, Redis, and BullMQ.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS · TypeORM · MySQL · BullMQ · Redis · JWT (httpOnly cookie) |
| BackendNet | ASP.NET · Entity Framework Core 8 · MySQL · HangFire · Redis · JWT (httpOnly cookie) |
| Frontend | React · Vite · TanStack Router · TanStack Query · Tailwind CSS · Framer Motion |
| Queue | BullMQ (Redis-backed async job processing) |
| Database | MySQL 8 |
| Containerization | Docker · Docker Compose |

---

## Prerequisites

Make sure the following are installed on your machine before proceeding.

| Tool | Minimum Version | Download |
|---|---|---|
| Node.js | 20.x | https://nodejs.org |
| npm | 10.x | bundled with Node.js |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop |
| Docker Compose | V2 (`docker compose`) | bundled with Docker Desktop |

> **Note:** Docker is only required if you want to run the database and Redis via containers (recommended). You can also run MySQL and Redis locally — see [Option B](#option-b--manual-local-setup) below.

---

## Project Structure

```
mock-up-test/
├── backend/          # NestJS API server
├── BackendNet/       # ASP.NET API server
├── frontend/         # React + Vite SPA
├── database/         # SQL DDL migration files (auto-loaded by Docker)
├── docker-compose.yml
└── README.md
```

---

## Option A — Run with Docker (Recommended)

This option starts MySQL, Redis, the backend, and the frontend all at once.

### 1. Clone the repository

```bash
git clone <repository-url>
cd mock-up-test
```

### 2. Start all services

```bash
docker compose up -d --build
```

Docker will:
- Start **MySQL 8** on port `3306` and auto-run all SQL files in `./database/`
- Start **Redis 7** on port `6379`
- Build and start the **NestJS backend** on port `3000`
- Build and start the **React frontend** (served via nginx) on port `5173`

### 3. Access the application

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Swagger docs | http://localhost:3000/api/docs |

### 4. Stop all services

```bash
docker compose down
```

To also remove persisted volumes (database data):

```bash
docker compose down -v
```

---

## Option B — Manual Local Setup

Use this if you prefer to run the app without Docker, or want hot-reload during development.

### 1. Start MySQL and Redis via Docker (infrastructure only)

```bash
docker compose up -d mysql redis
```

This starts only the database and Redis containers, leaving the app servers to run locally.

### 2. Set up the Backend

#### 2a. Install dependencies

```bash
cd backend
npm install
```

#### 2b. Create the environment file

```bash
cp .env.example .env
```

Open `.env` and verify the values match your local setup:

```dotenv
# Application
APP_PORT=3000
APP_ENV=development

# JWT — Access Token (short-lived, stored in httpOnly cookie)
JWT_ACCESS_SECRET=your_access_secret_here
JWT_ACCESS_EXPIRES_IN=15m

# JWT — Refresh Token (long-lived, stored in httpOnly cookie, hashed in DB)
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=edi_biodata

# Redis (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
```

> **Important:** Use different, long random strings for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in any environment beyond local dev.

#### 2c. Run database migrations

If you started MySQL via Docker Compose in step 1, the SQL files in `./database/` are automatically executed on first startup. If not, run them manually against your MySQL instance in order:

```
database/001_users.sql
database/002_biodata.sql
database/003_education.sql
database/004_training.sql
database/005_employment.sql
database/006_users_refresh_token.sql
```

#### 2d. Start the backend in development mode

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`.  
Swagger documentation: `http://localhost:3000/api/docs`.

---

### 3. Set up the Frontend

Open a **new terminal**, then:

#### 3a. Install dependencies

```bash
cd frontend
npm install
```

#### 3b. Verify the environment file

A `.env` file is already included. Confirm it points to your running backend:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

#### 3c. Start the frontend development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Default Credentials

The database is seeded with no default users. Register a new account via the Sign Up page.

To create an **Admin** account, manually update the `role` column in the `users` table:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## Available npm Scripts

### Backend (`/backend`)

| Command | Description |
|---|---|
| `npm run start:dev` | Start in watch mode (development) |
| `npm run start:prod` | Start compiled production build |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |

### Frontend (`/frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |

---

## Environment Variables Reference

### Backend (`.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `APP_PORT` | No | `3000` | HTTP port the server listens on |
| `APP_ENV` | No | `development` | Set to `production` to disable TypeORM sync |
| `JWT_ACCESS_SECRET` | **Yes** | — | Secret for signing access tokens |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_SECRET` | **Yes** | — | Secret for signing refresh tokens (must differ from access secret) |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `DB_HOST` | No | `localhost` | MySQL host |
| `DB_PORT` | No | `3306` | MySQL port |
| `DB_USERNAME` | **Yes** | — | MySQL username |
| `DB_PASSWORD` | **Yes** | — | MySQL password |
| `DB_DATABASE` | **Yes** | — | MySQL database name |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |

### Frontend (`.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | No | `http://localhost:3000` | Base URL for all API requests |

---

## Architecture Notes

- **Authentication** uses JWT stored as `httpOnly` cookies. The access token expires in 15 minutes. The refresh token (7 days) is hashed with bcrypt before being stored in the database, enabling server-side invalidation on logout.
- **Async mutations** (create, update, delete) are processed through **BullMQ** workers. The API immediately returns a `jobId` (HTTP 202), and the frontend polls `GET /biodata/jobs/:jobId` until the job completes or fails.
- **TypeORM `synchronize`** is enabled only when `APP_ENV=development`. In production, run migrations manually using the SQL files in `./database/`.

---

## Troubleshooting

**Port already in use**  
Stop the conflicting process or change the port in `.env` and `docker-compose.yml`.

**MySQL connection refused**  
Ensure MySQL is running (`docker compose ps`) and `DB_HOST`, `DB_PORT`, credentials match.

**Redis connection refused**  
Ensure Redis is running (`docker compose ps`) and `REDIS_HOST`, `REDIS_PORT` match.

**CORS errors in browser**  
Ensure `VITE_API_BASE_URL` in `frontend/.env` matches the URL the backend is actually running on, and that the backend `CORS` origin list includes your frontend URL.

**TypeORM sync error on startup**  
If you see column-not-found errors, the migration files may not have run yet. Execute `./database/*.sql` files against your MySQL instance in numerical order.

---

## Backend (.NET Alternative) — `BackendNet/`

A full feature-equivalent ASP.NET Core 8 port of the NestJS backend, located in `BackendNet/`.

### Tech Stack (.NET)

| Component | Technology |
|---|---|
| Framework | ASP.NET Core 8 Web API |
| ORM | Entity Framework Core 8 + Pomelo MySQL |
| Auth | JWT via `Microsoft.AspNetCore.Authentication.JwtBearer` (httpOnly cookie) |
| Async jobs | Hangfire + `Hangfire.Redis.StackExchange` |
| Password hashing | BCrypt.Net-Next (cost 12 for passwords, 10 for refresh tokens) |
| API docs | Swagger / Swashbuckle at `/api/docs` |
| Job dashboard | Hangfire at `/api/hangfire` (localhost-only) |

### Project Structure

```
BackendNet/
    ├── Controllers/          # AuthController, BiodataController, AdminController
    ├── Application/
    │   ├── DTOs/             # Request/response record types
    │   ├── Common/           # ApiResponse envelope, BiodataMapper
    │   └── Services/         # AuthService, BiodataService, BiodataJobHandler
    ├── Domain/
    │   ├── Enums.cs          # UserRole, Gender, Religion, BloodType, MaritalStatus, Degree
    │   └── Entities/         # User, Biodata, EducationHistory, TrainingHistory, EmploymentHistory
    ├── Infrastructure/
    │   ├── AppDbContext.cs   # EF Core DbContext with query filters + enum conversions
    │   ├── CookieHelper.cs   # httpOnly cookie option factories
    │   └── Middleware/       # ExceptionMiddleware (global error handler)
    ├── Program.cs            # App bootstrap, DI registration, middleware pipeline
    ├── appsettings.json      # Default configuration
    └── Dockerfile
```

### Running Locally

#### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
- MySQL 8 and Redis running (use `docker compose up -d mysql redis` from the project root)

#### Steps

```bash
cd backend-net/BackendNet

# (Optional) override settings via environment variables — see .env.example
cp .env.example .env   # for reference only; ASP.NET reads env vars directly

# Run in development mode (auto-migrates DB on startup)
dotnet run
```

The API will be available at `http://localhost:5000/api`.  
Swagger UI: `http://localhost:5000/api/docs`  
Hangfire dashboard: `http://localhost:5000/api/hangfire`

#### Build for production

```bash
dotnet publish -c Release -o ./publish
dotnet ./publish/BackendNet.dll
```

### Configuration

ASP.NET Core reads config from `appsettings.json` and overrides via environment variables using the `Section__Key` convention:

| Environment variable | Description |
|---|---|
| `Jwt__AccessSecret` | JWT access token signing secret |
| `Jwt__RefreshSecret` | JWT refresh token signing secret (must differ) |
| `Jwt__AccessExpiresIn` | Access token TTL (e.g. `15m`) |
| `Jwt__RefreshExpiresIn` | Refresh token TTL (e.g. `7d`) |
| `ConnectionStrings__Default` | MySQL connection string |
| `Redis__Connection` | Redis connection string (e.g. `localhost:6379`) |
| `ASPNETCORE_ENVIRONMENT` | `Development` or `Production` |
| `ASPNETCORE_URLS` | Listening URL (e.g. `http://+:5000`) |

### API Parity with NestJS Backend

Both backends expose **identical API contracts** — same routes, same HTTP status codes, same JSON response envelope — so the React frontend works with either one. Just change `VITE_API_BASE_URL` in `frontend/.env`:

```dotenv
# NestJS (port 3000)
VITE_API_BASE_URL=http://localhost:3000

# .NET (port 5000)
VITE_API_BASE_URL=http://localhost:5000
```

### Architecture Notes (.NET)

- **Authentication** mirrors the NestJS implementation exactly: dual JWT secrets, tokens in `httpOnly` cookies, refresh token hash stored in DB with bcrypt (cost 10), rotation on every refresh, reuse detection nullifies the hash.
- **Async mutations** use **Hangfire** (backed by Redis) instead of BullMQ. The controller enqueues a job and immediately returns HTTP 202 + `jobId`. The frontend polls `GET /api/biodata/jobs/:jobId` or `GET /api/admin/jobs/:jobId` for status — same polling contract as the NestJS version.
- **Soft deletes** are implemented via `DeletedAt` nullable timestamp + EF Core global query filters (equivalent to TypeORM's `@DeleteDateColumn`).
- **DB migrations** run automatically on startup in Development. For Production, run migrations explicitly: `dotnet ef database update`.
