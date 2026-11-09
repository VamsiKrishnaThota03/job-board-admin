# Job Management Admin Interface

A full-stack job board admin built with Next.js 14, Mantine and a NestJS + TypeORM + PostgreSQL REST API. You can browse, filter, create, edit and delete job postings.

![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Mantine](https://img.shields.io/badge/Mantine-7-339AF0?logo=mantine&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?logo=typeorm&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

## Live demo

<https://job-management-orpin.vercel.app>

| Job board | Create job | Mobile |
| --- | --- | --- |
| ![Job board with filters](docs/screenshots/jobs.png) | ![Create job modal](docs/screenshots/create-job.png) | ![Mobile layout](docs/screenshots/mobile.png) |

## Overview

- **`frontend/`**: a Next.js (App Router) app styled with Mantine and Tailwind. It shows job cards with search, location, job type and salary filters, and has a modal form for posting a job.
- **`backend/`**: a NestJS API with one `jobs` resource, stored in PostgreSQL through TypeORM and validated with `class-validator`.

## Features

- **Job listing** sorted by newest first, with a responsive grid (1-4 columns) and "posted 3h ago" badges. If the API cannot be reached, labelled sample listings are shown with a retry button.
- **Filters**, applied on the client:
  - Text search on title or company
  - Preferred location
  - Job type
  - Monthly salary range slider (understands "12 LPA" and monthly or annual ₹ ranges)
- **Job details** modal with salary, deadline and full description, plus **Edit** and **Delete** (with confirmation)
- **Create job** modal (`/?create=true`) with inline validation, an annual salary range, a date picker and **Save draft** (kept in `localStorage`)
- **Edit job** page at `/jobs/[id]/edit`, loaded from and saved to the API
- **Validated REST API**: the global `ValidationPipe` uses `whitelist` and `forbidNonWhitelisted`; DTOs restrict `jobType` (`Full-time`, `Part-time`, `Contract`, `Internship`) and `workMode` (`Onsite`, `Remote`, `Hybrid`) and cap field lengths
- **Optional write protection:** set `ADMIN_API_KEY` on the API to require an `x-admin-key` header for POST/PATCH/DELETE
- **CORS** limited to the origins in `FRONTEND_URL`; `GET /` is a health check
- **Tests:** backend unit tests plus e2e tests that run the real controllers and validation against an in-memory repository (no database needed)
- **Deploy configs**: `backend/render.yaml` for Render. The frontend is hosted on Vercel.

## Tech stack

| Layer    | Technology                                                                  |
|----------|-----------------------------------------------------------------------------|
| Frontend | Next.js 14, React 18, TypeScript, Mantine 7 (core, dates, notifications), Tailwind CSS 3, Tabler icons |
| Backend  | NestJS 10, TypeORM 0.3, `pg`, class-validator / class-transformer, `@nestjs/config` |
| Database | PostgreSQL (Neon in production). TLS with certificate verification by default. |

## Project structure

```
.
├── backend/
│   ├── src/
│   │   ├── main.ts                # Bootstrap, CORS, global ValidationPipe
│   │   ├── app.module.ts          # TypeORM (Postgres) + JobsModule + health route
│   │   ├── config/                # DATABASE_URL / TLS / CORS settings
│   │   ├── common/                # AdminKeyGuard (optional ADMIN_API_KEY)
│   │   └── jobs/
│   │       ├── jobs.controller.ts # /jobs routes
│   │       ├── jobs.service.ts
│   │       ├── entities/job.entity.ts
│   │       └── dto/               # CreateJobDto, UpdateJobDto
│   ├── test/                      # e2e tests + in-memory repository
│   └── render.yaml
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx           # Job board + filters
    │   │   └── jobs/              # create (modal) and [id]/edit pages
    │   ├── components/            # Header, SearchFilters, JobCard, JobDetailsModal, CreateJobModal, JobForm, CompanyLogo
    │   ├── lib/                   # salary parsing, date helpers, offline sample jobs
    │   ├── services/api.ts        # fetch wrapper for the jobs API
    │   ├── providers/MantineProvider.tsx
    │   └── types/job.ts
    └── public/images/             # Logos used on job cards
```

## Getting started

### Prerequisites

- Node.js 20+ (the backend's TypeORM version needs the global `crypto`) and npm
- PostgreSQL, local or hosted (for example Neon)

### 1. Clone

```bash
git clone https://github.com/VamsiKrishnaThota03/job-management.git
cd job-management
```

### 2. Backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env`. The API exits at startup if `DATABASE_URL` is missing.

| Variable         | Required | Description |
|------------------|----------|-------------|
| `DATABASE_URL`   | Yes | PostgreSQL connection string, e.g. `postgresql://<user>:<password>@<host>/<db>?sslmode=require` |
| `PORT`           | No  | API port (default `3001`) |
| `FRONTEND_URL`   | No  | Allowed CORS origin(s), comma-separated (default `http://localhost:3000`) |
| `DB_SSL`         | No  | Unset: verified TLS (no TLS for `localhost`). `no-verify`: TLS without certificate checks. `disable`: no TLS. |
| `DB_SYNCHRONIZE` | No  | `true` (default) lets TypeORM create/alter the `job` table from the entity; set `false` once you manage the schema yourself |
| `ADMIN_API_KEY`  | No  | When set, POST/PATCH/DELETE require the header `x-admin-key: <value>`. The bundled frontend does not send it, so use this to make a deployed API read-only. |

```bash
npm run start:dev      # watch mode
# or
npm run build && npm run start:prod
npm test && npm run test:e2e   # unit + e2e tests (no database needed)
```

### 3. Frontend

```bash
cd ../frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env.local`:

| Variable              | Description           | Example                  |
|-----------------------|-----------------------|--------------------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL      | `http://localhost:3001`  |

```bash
npm run dev
```

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:3001>

### Other scripts

| Location  | Command           | Purpose                    |
|-----------|-------------------|----------------------------|
| backend   | `npm run lint`    | ESLint (with `--fix`)      |
| backend   | `npm run format`  | Prettier                   |
| backend   | `npm test`        | Jest unit tests            |
| backend   | `npm run test:e2e`| API e2e tests (in-memory)  |
| root      | `npm run dev:backend` / `npm run dev:frontend` | Start either app from the repo root |
| frontend  | `npm run build`   | Production build           |
| frontend  | `npm run lint`    | `next lint`                |

## API

| Method | Path         | Purpose                                                       |
|--------|--------------|---------------------------------------------------------------|
| GET    | `/`          | Health check (`{"status":"ok"}`)                              |
| GET    | `/jobs`      | List all jobs (newest first)                                  |
| GET    | `/jobs/:id`  | Get one job (`404` if not found)                              |
| POST   | `/jobs`      | Create a job                                                  |
| PATCH  | `/jobs/:id`  | Update a job (partial)                                        |
| DELETE | `/jobs/:id`  | Delete a job (`204`)                                          |

Job payload:

```json
{
  "title": "Full Stack Developer",
  "companyName": "Acme",
  "location": "Bangalore",
  "jobType": "Full-time",
  "workMode": "Onsite",
  "experience": "1-3 yr",
  "salary": "12 LPA",
  "salaryRange": "₹6,00,000 - ₹12,00,000",
  "description": "Build and maintain web applications.",
  "applicationDeadline": "2030-12-31"
}
```

`experience` and `salary` are optional. All other fields are required.

## Known limitations

- There is no candidate side: "View details" shows the job, but there is no application flow.
- The API has no user accounts. Writes are open unless `ADMIN_API_KEY` is set, and the bundled frontend cannot send that key.
- Filtering and search run in the browser over all jobs; there is no server-side pagination.
- Locations come from a fixed list in `frontend/src/types/job.ts`.
