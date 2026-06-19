# Mini Job Application Tracker

A clean full-stack application for tracking job applications through hiring stages. It includes a React frontend, Express REST API, Prisma database layer, PostgreSQL schema, validation, filtering, search, pagination, tests, Docker support, and setup documentation for submission.

## Tech Stack

- Frontend: React, Vite, TypeScript, CSS, lucide-react icons
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Prisma ORM
- Validation: Zod
- Tests: Vitest
- Tooling: Docker Compose, ESLint

## Features

- List applications with company, title, type, status, applied date, and actions
- Add, edit, view, and delete applications
- Delete confirmation modal
- Filter by status
- Search by company name or job title
- Pagination
- Loading, success, and error states
- Frontend and backend validation
- PostgreSQL migration included

## Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop, or a local PostgreSQL instance

## Environment Variables

Copy `.env.example` to `.env` and adjust values if needed.

```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/job_tracker?schema=public"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
```

## Installation

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:generate
npx prisma migrate deploy
npm run db:seed
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

## Development

Run frontend and backend together:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

## Tests

```bash
npm test
```

## Build and Start

```bash
npm run build
npm start
```

The production server serves the built React app and the REST API from the same Express process.

## REST API

### List applications

```http
GET /applications?status=Applied&search=developer&page=1&limit=20
```

### Get one application

```http
GET /applications/:id
```

### Create application

```http
POST /applications
Content-Type: application/json

{
  "companyName": "InternSathi",
  "jobTitle": "Full Stack Intern",
  "jobType": "Internship",
  "status": "Applied",
  "appliedDate": "2026-06-18",
  "notes": "Submitted assignment."
}
```

### Update application

```http
PATCH /applications/:id
Content-Type: application/json

{
  "status": "Interviewing"
}
```

### Delete application

```http
DELETE /applications/:id
```

## Data Model

```text
id: UUID, auto-generated
company_name: String, required
job_title: String, required
job_type: Internship / Full-time / Part-time
status: Applied / Interviewing / Offer / Rejected
applied_date: Date, required
notes: Text, optional
created_at: Timestamp, auto-set
updated_at: Timestamp, auto-updated
```

The TypeScript API uses camelCase field names, while Prisma maps the database columns to the snake_case names above.

## Screenshots

### Application List
![Application List](screenshots/S1.png)

### Add Application Form
![Add Application](screenshots/S2.png)

### Edit Application
![Edit Application](screenshots/S3.png)

### Delete 
![Delete Confirmation](screenshots/S4.png)

### Filter by Status
![F1](screenshots/S5.png)


![F2](screenshots/S6.png)


![F3](screenshots/S7.png)

### Search
![F4](screenshots/S8.png)
![F5](screenshots/S9.png)





## Architecture Notes

The app is intentionally small and submission-focused. React owns UI state, form validation, loading states, and optimistic-feeling refreshes after mutations. Express exposes a REST API with Zod validation at the boundary and centralized error handling. Prisma owns schema design, migrations, and database access. The database stores snake_case columns matching the assignment, while TypeScript code uses camelCase for maintainability.

## AI Usage

## AI Usage
I used AI as a coding assistant to speed up scaffolding (project structure, boilerplate for the React UI and Express API) and to draft initial documentation. I made the architecture decisions (Prisma schema design, REST endpoint structure, validation approach with Zod), reviewed and tested all generated code, and adjusted it to match the assignment requirements before submission.
