# Job Management Admin Interface

A full-stack job board admin built with Next.js 14, Mantine and a NestJS + TypeORM + PostgreSQL REST API. You can browse, filter, create and edit job postings.

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

## Overview

- **`frontend/`**: a Next.js (App Router) app styled with Mantine and Tailwind. It shows job cards with search, location, job type and salary filters, and has a modal form for posting a job.
- **`backend/`**: a NestJS API with one `jobs` resource, stored in PostgreSQL through TypeORM and validated with `class-validator`.

## Features

- **Job listing** sorted by newest first. A set of sample cards is always shown next to jobs from the API.
- **Filters**, applied on the client:
  - Text search on title or company
  - Preferred location
  - Job type
  - Salary range slider
- **Create job** modal (`/?create=true`) using React Hook Form and Mantine inputs, including a date picker for the application deadline
- **Edit job** page at `/jobs/[id]/edit`
- **Validated REST API**: the global `ValidationPipe` uses `whitelist` and `forbidNonWhitelisted`, and the DTOs use enums for `jobType` (`Full-time`, `Part-time`, `Contract`, `Internship`) and `workMode` (`Onsite`, `Remote`, `Hybrid`)
- **CORS** limited to `FRONTEND_URL`
- **Deploy configs**: `backend/render.yaml` for Render. The frontend is hosted on Vercel.

## Tech stack

| Layer    | Technology                                                                  |
|----------|-----------------------------------------------------------------------------|
| Frontend | Next.js 14, React 18, TypeScript, Mantine 7 (core, dates, notifications), Tailwind CSS 3, React Hook Form, Tabler icons |
| Backend  | NestJS 10, TypeORM 0.3, `pg`, class-validator / class-transformer, `@nestjs/config` |
| Database | PostgreSQL. SSL is enabled for hosted databases such as Neon.               |

## Project structure

```
.
├── backend/
│   ├── src/
│   │   ├── main.ts                # Bootstrap, CORS, global ValidationPipe
│   │   ├── app.module.ts          # TypeORM (Postgres) + JobsModule
│   │   └── jobs/
│   │       ├── jobs.controller.ts # /jobs routes
│   │       ├── jobs.service.ts
│   │       ├── entities/job.entity.ts
│   │       └── dto/               # CreateJobDto, UpdateJobDto
│   ├── test/                      # Jest e2e config
│   └── render.yaml
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx           # Job board + filters
    │   │   └── jobs/              # create (modal) and [id]/edit pages
    │   ├── components/            # Header, JobCard, JobForm, JobList, SearchFilters
    │   ├── services/api.ts        # fetch wrapper for the jobs API
    │   ├── providers/MantineProvider.tsx
    │   └── types/job.ts
    └── public/images/             # Logos used on job cards
```

## Getting started

### Prerequisites

- Node.js 18+ and npm
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

Create `backend/.env`:

| Variable       | Description                                         | Example                                                  |
|----------------|-----------------------------------------------------|----------------------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string                        | `postgresql://<user>:<password>@<host>:5432/<db>`        |
| `PORT`         | API port (defaults to `3001`)                       | `3001`                                                   |
| `FRONTEND_URL` | Allowed CORS origin (defaults to `http://localhost:3000`) | `http://localhost:3000`                            |

```bash
npm run start:dev      # watch mode
# or
npm run build && npm run start:prod
```

TypeORM `synchronize: true` creates the `job` table automatically. The connection always uses SSL (`rejectUnauthorized: false`). If your local Postgres does not accept SSL, change this in `app.module.ts`.

### 3. Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

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
| frontend  | `npm run build`   | Production build           |
| frontend  | `npm run lint`    | `next lint`                |

## API

| Method | Path         | Purpose                                                       |
|--------|--------------|---------------------------------------------------------------|
| GET    | `/jobs`      | List all jobs (newest first)                                  |
| GET    | `/jobs/:id`  | Get one job (`404` if not found)                              |
| POST   | `/jobs`      | Create a job                                                  |
| PATCH  | `/jobs/:id`  | Update a job (partial)                                        |
| DELETE | `/jobs/:id`  | Delete a job                                                  |

Job payload:

```json
{
  "title": "Full Stack Developer",
  "companyName": "Acme",
  "location": "Bangalore",
  "jobType": "Full-time",
  "workMode": "Onsite",
  "experience": "1-3 yr",
  "salary": "8 LPA",
  "salaryRange": "₹20,000 - ₹70,000",
  "description": "Build and maintain web applications.",
  "applicationDeadline": "2025-12-31T00:00:00.000Z"
}
```

`experience` and `salary` are optional. All other fields are required.
