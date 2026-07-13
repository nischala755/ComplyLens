# ComplyLens

ComplyLens is a standalone compliance operations application for assessing customer and contact records against a deterministic interpretation of India’s Digital Personal Data Protection Act, 2023 (DPDP).

It is a single-deployment Next.js application. There is no separate Express, NestJS, Java, Salesforce, or Python backend. The backend runs through Next.js Route Handlers and server-side TypeScript services in the same project as the React frontend.

> **Core design rule:** the deterministic rule engine decides the score and status. Mistral can explain an existing result, but it cannot create, change, or override a compliance decision.

## Contents

- [Demo walkthrough](#demo-walkthrough)
- [What is the backend?](#what-is-the-backend)
- [Architecture](#architecture)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Compliance rules and scoring](#compliance-rules-and-scoring)
- [Database model](#database-model)
- [API reference](#api-reference)
- [Authentication](#authentication)
- [Mistral integration](#mistral-integration)
- [Local development](#local-development)
- [Database commands](#database-commands)
- [Testing and verification](#testing-and-verification)
- [Deployment](#deployment)
- [Security notes](#security-notes)
- [Troubleshooting](#troubleshooting)

## Demo walkthrough

For a complete presenter-ready walkthrough—from login and batch assessment through blast radius, fix simulation, Mistral explanations, rights requests, audit evidence, report export, and logout—see [DEMO_GUIDE.md](DEMO_GUIDE.md).

## What is the backend?

The backend consists of four layers:

1. **Next.js Route Handlers** in `app/api/` receive HTTP requests and return JSON or CSV responses.
2. **TypeScript services** in `lib/services/` perform assessments, scoring, recommendations, simulations, blast-radius calculations, and AI explanation orchestration.
3. **Prisma ORM** provides typed database access through `lib/db.ts`.
4. **PostgreSQL** stores contacts, consent, purposes, assessments, results, recommendations, audit events, users, rights requests, incidents, and rule versions. Neon is the recommended hosted PostgreSQL provider.

The frontend calls endpoints such as `/api/contacts`, `/api/assessments/run`, and `/api/fix-simulator`. Those handlers call the service layer, which uses Prisma to read or write PostgreSQL.

Mistral is an external service used only by `lib/services/aiExplainer.ts`. It receives a controlled JSON context assembled from persisted assessment data. It does not receive a database connection or a route capable of changing scores.

## Architecture

```mermaid
flowchart LR
    Browser[React user interface] --> Routes[Next.js API Route Handlers]
    Routes --> Auth[Signed cookie session]
    Routes --> Services[TypeScript service layer]
    Services --> Rules[Deterministic rule engine]
    Services --> Prisma[Prisma Client]
    Prisma --> Postgres[(PostgreSQL / Neon)]
    Services --> Audit[Audit logging]
    Audit --> Postgres
    Services --> Explainer[Mistral explainer]
    Explainer --> Mistral[Mistral API]

    Rules -. final score and status .-> Services
    Mistral -. explanation only .-> Explainer
```

An assessment request follows this sequence:

```mermaid
sequenceDiagram
    participant UI as Dashboard
    participant API as /api/assessments/run
    participant Service as assessmentService
    participant Engine as ruleEngine + riskScoring
    participant DB as PostgreSQL

    UI->>API: POST contactId or contactIds
    API->>Service: runAssessment(...)
    Service->>DB: Load contact evidence
    Service->>Engine: Evaluate five rules
    Engine-->>Service: Rule results, score, status
    Service->>DB: Insert assessment and results
    Service->>DB: Insert recommendations and audit event
    Service-->>API: Persisted assessment
    API-->>UI: JSON response
```

## Features

- Credential-based internal login with a signed HTTP-only session cookie
- Dashboard KPIs for compliance rate, at-risk contacts, non-compliant contacts, and assessment coverage
- Searchable, sortable, and status-filterable contact table
- Deterministic single-contact and batch assessment execution
- Per-rule pass/fail evidence with stable reason codes
- Risk score and compliance-status calculation
- Prioritized readiness recommendations
- Read-only fix simulation with projected score and status
- Deterministic blast-radius exposure calculation
- Assessment history and score trends
- Mistral-powered, evidence-grounded explanations
- AI quick questions and consent-renewal what-if explanation
- Filterable audit trail for assessments, simulations, questions, and answers
- DPDP rights-request tracker with SLA countdowns
- CSV compliance report export
- Database support for rule version history and incident records
- Responsive desktop and mobile interface

## Technology stack

| Area | Technology |
|---|---|
| Application framework | Next.js 15 App Router |
| Frontend | React 19 and TypeScript |
| Backend HTTP layer | Next.js Route Handlers |
| Business logic | Server-side TypeScript service modules |
| Database | PostgreSQL, with Neon recommended |
| ORM | Prisma |
| Authentication | `bcryptjs`, `jose`, and an HTTP-only cookie |
| AI explanation | Mistral API using `mistral-large-latest` |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Tests | Vitest |
| Recommended hosting | Vercel and Neon |

## Project structure

```text
complylens/
├── app/
│   ├── (protected)/
│   │   ├── audit/                 Audit-trail page
│   │   ├── contacts/[id]/         Contact detail workspace
│   │   ├── dashboard/             Main compliance dashboard
│   │   └── rights/                Rights-request tracker
│   ├── api/
│   │   ├── ai/ask/                Mistral explanation endpoint
│   │   ├── assessments/run/       Assessment orchestration endpoint
│   │   ├── audit/                 Audit-log query endpoint
│   │   ├── auth/                  Login and logout endpoints
│   │   ├── contacts/              Contact list and detail endpoints
│   │   ├── fix-simulator/         Read-only projection endpoint
│   │   ├── reports/               CSV report export
│   │   └── rights-requests/       Rights-request endpoints
│   ├── login/                     Login page
│   ├── globals.css                Global design system styles
│   └── layout.tsx                 Root layout and metadata
├── components/                    Interactive React components
├── lib/
│   ├── services/
│   │   ├── aiExplainer.ts         Controlled Mistral integration
│   │   ├── assessmentService.ts   Assessment persistence orchestration
│   │   ├── blastRadius.ts         Exposure calculation
│   │   ├── fixSimulator.ts        Read-only score projection
│   │   ├── readinessAdvisor.ts    Recommendation generation
│   │   ├── riskScoring.ts         Score and status calculation
│   │   └── ruleEngine.ts          Pure five-rule evaluator
│   ├── auth.ts                    JWT creation and verification helpers
│   ├── db.ts                      Shared Prisma client
│   └── types.ts                   Deterministic-core types
├── prisma/
│   ├── migrations/                Initial PostgreSQL migration
│   ├── schema.prisma              Relational data model
│   └── seed.ts                    Rules, users, contacts, and demo data
├── tests/core.test.ts             Rule, score, persona, and simulator tests
├── middleware.ts                  Protected-route middleware
└── .env.example                   Required environment-variable template
```

## Compliance rules and scoring

Every contact begins with a score of 100. Failed rules subtract the configured number of points.

| Code | Rule | Severity | Deduction | Deterministic check |
|---|---|---:|---:|---|
| `DPDP-001` | Consent Validation | Critical | 30 | At least one active consent record exists and is not expired |
| `DPDP-002` | Purpose Validation | High | 20 | At least one active processing purpose has a lawful basis |
| `DPDP-003` | Retention Validation | High | 20 | A retention end date exists and has not passed |
| `DPDP-004` | Transparency Notice | Medium | 15 | The transparency-notice flag is true |
| `DPDP-005` | Data Minimization | Medium | 15 | The minimization status is `compliant` |

The score is floored at zero. Status bands are:

| Score | Status |
|---:|---|
| 80–100 | Compliant |
| 50–79 | At Risk |
| 0–49 | Non-Compliant |

The rule engine is a pure function. It does not write to the database, call Mistral, inspect natural-language responses, or depend on UI state.

### Seeded personas

The seed script creates six contacts designed to exercise the main rule scenarios:

| Contact | Scenario |
|---|---|
| Aisha Mehta | Passes all five rules |
| Rahul Sharma | Missing active consent |
| Priya Nair | Expired retention period |
| Arjun Rao | Missing consent, expired retention, and failed minimization |
| Neha Kapoor | Missing active processing purpose |
| Imran Khan | Transparency notice not recorded |

The seeded blast-radius records include departments, workflows, campaigns, and integrations with low, medium, or high impact levels.

## Database model

The main Prisma models are:

| Model | Purpose |
|---|---|
| `Contact` | Data principal/customer being assessed |
| `ConsentRecord` | Consent status, source, grant date, expiry, and purpose |
| `ProcessingPurpose` | Purpose, lawful basis, and active state |
| `ComplianceRule` | Rule metadata, severity, and deduction |
| `ComplianceRuleVersion` | Historical version and logic summary for a rule |
| `ComplianceAssessment` | Immutable score/status snapshot for one run |
| `ComplianceResult` | Pass/fail result and reason for one rule |
| `ComplianceRecommendation` | Ranked remediation action for a failed rule |
| `BlastRadiusLink` | Affected department, workflow, campaign, or integration |
| `AuditLog` | Assessment, simulation, and AI interaction evidence |
| `RightsRequest` | Access, correction, erasure, or grievance request and SLA |
| `IncidentLog` | Breach or incident register data |
| `User` | Login identity, password hash, and role |

Each assessment creates a new `ComplianceAssessment` rather than overwriting an older record. This preserves score history and makes trend charts possible.

## API reference

All application endpoints require the session cookie except `/api/auth/login` and `/api/auth/logout`.

### Authentication

#### `POST /api/auth/login`

Authenticates a user and sets the `complylens_session` HTTP-only cookie.

```json
{
  "email": "admin@complylens.local",
  "password": "ComplyLens123!"
}
```

Successful response:

```json
{ "ok": true }
```

#### `POST /api/auth/logout`

Expires the session cookie.

### Contacts

#### `GET /api/contacts`

Returns every contact with its latest assessment attached as `latestAssessment`.

#### `GET /api/contacts/:id`

Returns the contact, consent records, processing purposes, complete assessment history, rule results, recommendations, and computed blast radius.

### Assessments

#### `POST /api/assessments/run`

Run one assessment:

```json
{ "contactId": "contact_cuid" }
```

Run a batch assessment:

```json
{ "contactIds": ["contact_1", "contact_2"] }
```

The endpoint loads evidence, evaluates the deterministic rules, calculates the score/status, persists the result, generates recommendations, and writes an audit event.

### Fix simulator

#### `POST /api/fix-simulator`

```json
{
  "assessmentId": "assessment_cuid",
  "ruleCodes": ["DPDP-001", "DPDP-003"]
}
```

Example response:

```json
{
  "currentScore": 50,
  "projectedScore": 100,
  "delta": 50,
  "projectedStatus": "Compliant"
}
```

This endpoint does not update the contact, assessment, result, or recommendation tables. It records only a `fix_simulation` audit event.

### AI explainer

#### `POST /api/ai/ask`

```json
{
  "contactId": "contact_cuid",
  "question": "What should we fix first?"
}
```

Successful response:

```json
{ "answer": "...grounded explanation..." }
```

The service builds context from the latest persisted assessment, results, recommendations, and blast radius. Questions about consent-renewal score improvement run the deterministic fix simulator first and provide its exact result to Mistral.

### Audit trail

#### `GET /api/audit`

Supported query parameters:

- `page`: one-based page number
- `eventType`: `assessment_run`, `fix_simulation`, `ai_question`, or `ai_answer`

The page size is 50 records.

### Rights requests

#### `GET /api/rights-requests`

Returns rights requests ordered by due date.

#### `POST /api/rights-requests`

```json
{
  "contactId": "contact_cuid",
  "type": "access",
  "slaHours": 72
}
```

Valid application-level request types are `access`, `correction`, `erasure`, and `grievance`.

#### `PATCH /api/rights-requests/:id`

```json
{ "status": "completed" }
```

### Reports

#### `GET /api/reports`

Returns `complylens-report.csv` containing each contact and its latest score, status, violation count, and assessment timestamp.

## Authentication

Passwords are hashed with bcrypt. A successful login creates a signed JWT using `SESSION_SECRET` and stores it in an HTTP-only, same-site cookie with an eight-hour lifetime. Secure cookies are enabled automatically in production.

The seed creates this development account unless environment variables override it:

```text
Email:    admin@complylens.local
Password: ComplyLens123!
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before seeding a real environment. Never use the default password in production.

The current product is single-tenant. The `User.role` field is ready for expanded role-based access control, but department-level authorization policies are not yet implemented.

## Mistral integration

The Mistral API key is used only on the server. Never prefix it with `NEXT_PUBLIC_` and never place it in a React component.

`aiExplainer.ts` performs the following steps:

1. Loads the contact’s latest persisted assessment.
2. Loads its deterministic results and ranked recommendations.
3. Computes blast-radius context.
4. Optionally runs the deterministic fix simulator for supported what-if questions.
5. Writes an `ai_question` audit event.
6. Sends a strict system prompt and structured JSON context to `mistral-large-latest`.
7. Writes the returned explanation as an `ai_answer` audit event.

The system prompt forbids Mistral from changing status, inventing facts or scores, and providing legal interpretations beyond the supplied rule descriptions.

If `MISTRAL_API_KEY` is absent, assessment, scoring, simulation, reporting, and all non-AI features continue to work. The AI endpoint returns a configuration error.

## Local development

### Prerequisites

- Node.js 20 or newer
- npm
- A PostgreSQL database, local or hosted
- A Mistral API key if AI explanations are required

### 1. Install dependencies

```bash
npm install
```

On Windows PowerShell systems that block `npm.ps1`, use:

```powershell
npm.cmd install
```

### 2. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

PowerShell equivalent:

```powershell
Copy-Item .env.example .env
```

Configure these values:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
MISTRAL_API_KEY="your-rotated-server-side-key"
SESSION_SECRET="a-long-random-secret"
ADMIN_EMAIL="admin@complylens.local"
ADMIN_PASSWORD="replace-this-password"
```

Generate a session secret with a password manager or a cryptographically secure random generator. Do not commit `.env`; it is ignored by Git.

### 3. Apply the database schema

For normal setup using the checked-in migration:

```bash
npx prisma migrate deploy
```

For disposable local development where migration history is not important:

```bash
npx prisma db push
```

### 4. Seed demo data

```bash
npm run db:seed
```

The seed is intended for a demo/development database. It clears the seeded compliance-domain records before recreating them. Do not run it against production data.

### 5. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in using the seeded credentials. Run all assessments from the dashboard to create the first score snapshots.

## Database commands

| Command | Purpose |
|---|---|
| `npx prisma generate` | Generate the typed Prisma client |
| `npx prisma validate` | Validate `schema.prisma` |
| `npx prisma migrate deploy` | Apply checked-in migrations |
| `npm run db:push` | Push the schema directly in development |
| `npm run db:seed` | Recreate rules, personas, blast links, and admin user |
| `npx prisma studio` | Open Prisma’s local database browser |

## Testing and verification

Run the deterministic-core test suite:

```bash
npm test
```

Watch tests during development:

```bash
npm run test:watch
```

Run TypeScript validation:

```bash
npx tsc --noEmit
```

Create a production build:

```bash
npm run build
```

The current core suite covers:

- A fully passing contact
- Every individual rule failure
- Expired and withdrawn consent
- All six seeded persona scenarios
- Status-band calculation
- Zero-point score flooring
- Exact fix-simulator deductions
- Simulator non-mutation behavior

At the time of this README update, all 15 tests and the production build pass.

## Deployment

### Neon database

1. Create a PostgreSQL project in Neon.
2. Copy the pooled connection string.
3. Use it as `DATABASE_URL`.
4. Apply the migration with `npx prisma migrate deploy`.
5. Seed only if you want the demo personas in that environment.

### Vercel application

1. Push the project to a private Git repository.
2. Import the repository into Vercel.
3. Add `DATABASE_URL`, `MISTRAL_API_KEY`, `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in Vercel project settings.
4. Ensure the build command is `npm run build`.
5. Deploy the project.
6. Run the database migration and optional seed against the Neon database.
7. Sign in and run the initial batch assessment.

For a production deployment, use separate development, preview, and production databases. Do not allow preview deployments to seed or mutate production records.

## Security notes

- Rotate any credential that has been pasted into chat, source code, screenshots, or issue trackers.
- Keep `MISTRAL_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`, and admin credentials server-side.
- Do not commit `.env` or `.env.local`.
- Replace the default seeded admin password before deployment.
- Use a private repository for real compliance data integrations.
- Apply least-privilege PostgreSQL credentials in production.
- Restrict production access at the organization or identity-provider level in addition to application login.
- Back up the PostgreSQL database and define audit-log retention procedures.
- Treat AI explanations as operational summaries, not legal advice.
- Have qualified privacy/legal personnel validate rule logic before using the application for real compliance decisions.

The application enforces the engine/AI separation at the service boundary: assessment writes occur through `assessmentService`, while `aiExplainer` reads assessment context and can only invoke the read-only simulator. Mistral output is never passed into score or status persistence.

## Troubleshooting

### `MISTRAL_API_KEY is not configured`

Add the key to `.env` locally or the Vercel environment settings, then restart/redeploy. Do not expose the key through a `NEXT_PUBLIC_*` variable.

### Prisma cannot connect to the database

Check that `DATABASE_URL` is present, the host is reachable, the password is URL-encoded, and Neon’s connection string includes the required SSL configuration.

### Tables do not exist

Apply the checked-in migration:

```bash
npx prisma migrate deploy
```

### Login fails after seeding

Confirm the values of `ADMIN_EMAIL` and `ADMIN_PASSWORD` that were present when the seed ran. Re-running the seed updates the configured admin user’s password hash, but also resets the demo compliance data.

### Dashboard shows “Not assessed”

This is expected immediately after seeding. Click **Run all assessments** on the dashboard. Assessments are deliberately not hard-coded into the seed so the complete engine and audit path can be demonstrated.

### `npm` is blocked in PowerShell

Use `npm.cmd` instead of `npm`, or adjust the local PowerShell execution policy according to your organization’s security standards.

### Production build succeeds but runtime pages fail

The build can generate Prisma types without contacting a live database. Runtime API routes still require a working `DATABASE_URL` and applied migrations.

## Important scope statement

ComplyLens is compliance workflow software, not legal advice. Its rule set represents the application’s encoded policy checks and must be reviewed against the organization’s actual processing activities, notices, contracts, retention schedules, and legal obligations before production use.
