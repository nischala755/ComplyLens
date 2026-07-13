# ComplyLens — Complete Demo Guide

This guide walks through ComplyLens from the first visible feature to the last. It is written for a live product demonstration, recorded walkthrough, internal review, hackathon presentation, or customer discovery session.

## Demo objective

By the end of the demonstration, the audience should understand that:

1. ComplyLens evaluates DPDP compliance using deterministic TypeScript rules.
2. Every score and status can be traced to specific evidence.
3. Fix simulation is read-only and uses exact rule deductions.
4. Mistral explains verified results but cannot alter them.
5. Assessments, simulations, and AI interactions create an audit trail.
6. The product also supports rights-request operations, trends, blast-radius analysis, and report export.

## Recommended demo duration

| Version | Duration | Recommended coverage |
|---|---:|---|
| Executive overview | 5 minutes | Login, dashboard, Arjun, simulator, AI, audit |
| Standard product demo | 12–15 minutes | All major UI features |
| Full technical demo | 25–30 minutes | UI, rule logic, APIs, database model, tests, and architecture |

The main walkthrough below is designed for approximately 15 minutes.

---

## 1. Before the demo

### Required services

- Docker Desktop must be running.
- The `complylens-postgres` container must be running.
- The Next.js development server must be running.
- Port `3000` must be available.
- A valid Mistral API key must be configured in `.env` for the AI portion.

### Application links

- On this computer: [http://localhost:3000](http://localhost:3000)
- From another device on the same network: `http://<computer-ip>:3000`

The computer’s network address can change between sessions. Use `ipconfig` on Windows to confirm it before sharing the LAN link.

### Demo login

```text
Email:    admin@complylens.local
Password: ComplyLens123!
```

Change these credentials before any production deployment.

### Start the database

If the existing container is stopped:

```powershell
docker start complylens-postgres
```

If the database container has never been created, follow the full setup instructions in `README.md`.

### Start the application

```powershell
npm.cmd run dev
```

Wait until the terminal shows:

```text
Ready
Local: http://localhost:3000
```

### Optional clean reset

Use this only when you want to restore the original six personas and clear previous assessments, rights requests, and audit events:

```powershell
node --env-file=.env node_modules\tsx\dist\cli.mjs prisma\seed.ts
```

> The seed deletes and recreates demo-domain data. Never run it against a production database.

### Browser preparation

Before presenting:

1. Use a desktop browser at 100% zoom.
2. Close unrelated tabs and disable distracting notifications.
3. Open `http://localhost:3000/login`.
4. Keep the browser developer console closed unless giving the technical demo.
5. Confirm that Mistral questions work before the audience arrives.
6. If the database was reset, do not run assessments yet—the first batch assessment is part of the story.

---

## 2. Know the six demo personas

| Contact | Intended evidence scenario | Failed rules | Score | Status |
|---|---|---|---:|---|
| Aisha Mehta | Clean reference contact | None | 100 | Compliant |
| Rahul Sharma | Missing active consent | DPDP-001 | 70 | At Risk |
| Priya Nair | Retention period expired | DPDP-003 | 80 | Compliant |
| Arjun Rao | Missing consent, expired retention, failed minimization | DPDP-001, DPDP-003, DPDP-005 | 35 | Non-Compliant |
| Neha Kapoor | No active lawful processing purpose | DPDP-002 | 80 | Compliant |
| Imran Khan | Transparency notice not recorded | DPDP-004 | 85 | Compliant |

Why does a contact with one failed rule sometimes still show as **Compliant**? Status is score-based:

- 80–100: Compliant
- 50–79: At Risk
- 0–49: Non-Compliant

This is useful to explain during the demo: a compliant status does not mean every individual check passed. The violation count and rule evidence remain visible.

> Arjun’s exact score is 35: `100 - 30 - 20 - 15 = 35`. This follows the configured deductions even if an earlier concept document referenced a different example score.

---

## 3. Presenter opening

Suggested opening script:

> “ComplyLens is a standalone DPDP compliance workspace. Its most important design principle is that deterministic application code decides compliance. AI never calculates a score and never changes a status. It only explains results that the rule engine has already computed.”

Then briefly describe the product flow:

```text
Contact evidence → deterministic rules → score and status → recommendations
                                                ↓
                                      grounded AI explanation
```

Do not start with Mistral. Establish the deterministic engine first so the audience understands the trust boundary.

---

## 4. Feature 1 — Login and protected workspace

### What to do

1. Open [http://localhost:3000](http://localhost:3000).
2. The app should redirect to `/login` if no valid session exists.
3. Use the demo credentials.
4. Click **Sign in**.

### What to point out

- The application is an internal compliance-officer workspace.
- Passwords are stored as bcrypt hashes, not plaintext.
- Successful authentication creates an HTTP-only signed session cookie.
- Protected application pages require the session.

### Suggested narration

> “This is a single-tenant internal tool. The browser receives an HTTP-only signed session cookie, while database and Mistral credentials remain on the server.”

### Expected result

The app opens `/dashboard` and shows the ComplyLens navigation header.

---

## 5. Feature 2 — Dashboard before assessment

This step is most effective immediately after a clean seed.

### What to show

- Four KPI cards
- Contact compliance table
- Search control
- Status filter
- Score-sort control
- Assessment distribution panel
- **Export report** button
- **Run all assessments** button

### Expected initial state

- Six contacts appear.
- Their scores show as not assessed.
- The chart displays an empty-state message.
- Assessment coverage is zero.

### Suggested narration

> “The seed creates evidence, not pre-baked compliance answers. We deliberately run the engine live so every score travels through the real assessment, persistence, recommendation, and audit path.”

---

## 6. Feature 3 — Batch deterministic assessment

### What to do

1. Click **Run all assessments**.
2. Wait for the button to return to its normal state.
3. Observe the KPI, table, and chart updates.

### Expected results

- Aisha: 100, Compliant, 0 violations
- Rahul: 70, At Risk, 1 violation
- Priya: 80, Compliant, 1 violation
- Arjun: 35, Non-Compliant, 3 violations
- Neha: 80, Compliant, 1 violation
- Imran: 85, Compliant, 1 violation

### What happened in the backend

For each contact, ComplyLens:

1. Loaded consent and processing-purpose evidence.
2. Evaluated all five rules.
3. Started at 100 and subtracted exact deductions.
4. Mapped the score to a status band.
5. Inserted a new assessment snapshot.
6. Inserted five rule results.
7. Generated ranked recommendations for failed rules.
8. Inserted an `assessment_run` audit event.

### Suggested narration

> “This is not an AI scan. These six assessments are produced by ordinary, testable TypeScript logic. Every rule returns a stable pass/fail result, reason code, and evidence message.”

---

## 7. Feature 4 — Dashboard discovery tools

### Search

1. Type `Arjun` in the search field.
2. Confirm that only Arjun Rao remains.
3. Clear the search.

### Status filtering

1. Choose **At Risk** to show Rahul Sharma.
2. Choose **Non-Compliant** to show Arjun Rao.
3. Return to **All**.

### Sorting

1. Click the score-sort control.
2. Point out that risk can be prioritized without changing data.

### Chart

The assessment distribution panel now visualizes the contacts’ latest scores.

### Suggested narration

> “A compliance officer can move from organization-level posture to a specific data principal in a few seconds.”

---

## 8. Feature 5 — Clean reference contact

Open **Aisha Mehta** first.

### Assessment tab

Show that:

- The score is 100/100.
- All five rule rows pass.
- Each rule includes a plain evidence statement.
- The violation count is zero.

### Why show Aisha first?

A clean reference makes later failures easier to understand. It demonstrates that the detail screen is useful even when no remediation is needed.

### Readiness advisor tab

Open **Readiness advisor** and show the no-remediation state.

### Blast radius tab

Open **Blast radius** and show Aisha’s low-impact integration link. Explain that blast radius still renders for a compliant record.

### Suggested narration

> “A clean result is still evidence-backed. ComplyLens does not hide the evaluation just because all checks passed.”

Return to the dashboard.

---

## 9. Feature 6 — At-risk consent scenario

Open **Rahul Sharma**.

### What to show

- Score: 70
- Status: At Risk
- Violation count: 1
- DPDP-001 is the failed rule
- The remaining four checks pass

### Explain the score

```text
Starting score:             100
DPDP-001 consent failure:   -30
Final score:                 70
Status:                 At Risk
```

### Suggested narration

> “Rahul is missing active, non-expired consent. The engine subtracts exactly 30 points. There is no probabilistic model and no confidence score involved.”

Return to the dashboard.

---

## 10. Feature 7 — Individual rule scenarios

Use these contacts when the audience wants to see other rule types:

### Priya Nair — Retention

- Open Priya.
- Show failed `DPDP-003`.
- Explain that the data-retention end date has passed.
- Note that the final score remains exactly 80, so the score band is Compliant even though the violation is visible.

### Neha Kapoor — Processing purpose

- Open Neha.
- Show failed `DPDP-002`.
- Explain that no active lawful processing purpose was found.

### Imran Khan — Transparency

- Open Imran.
- Show failed `DPDP-004`.
- Explain that the system has no record of the transparency notice being provided.

For a 15-minute demo, summarize these personas from the table rather than opening all three.

---

## 11. Feature 8 — Multi-violation investigation

Open **Arjun Rao**. Keep this contact open for the next several features.

### Score summary

- Risk score: 35/100
- Status: Non-Compliant
- Rules passed: 2/5
- Blast exposure: High

### Assessment tab

Show the three failed rules:

| Rule | Failure | Deduction |
|---|---|---:|
| DPDP-001 | No active, non-expired consent | 30 |
| DPDP-003 | Retention period expired | 20 |
| DPDP-005 | Minimization is non-compliant | 15 |

Score calculation:

```text
100 - 30 - 20 - 15 = 35
```

### Suggested narration

> “Arjun is the strongest investigation scenario. Three independent evidence failures combine into a score of 35, which maps deterministically to Non-Compliant.”

---

## 12. Feature 9 — Blast-radius analysis

While viewing Arjun, open **Blast radius**.

### Summary cards

Expected seeded counts:

- Departments: 2
- Workflows: 4
- Campaigns: 0
- Integrations: 0

### Detailed links

Expand several entries, including:

- Sales
- Customer Support
- Email nurture
- Billing automation
- Lead routing
- Renewal alerts

### Exposure level

Arjun’s exposure is **High** because:

- His latest status is Non-Compliant.
- At least two related items have high impact.

This is deterministic business logic, not an AI classification.

### Suggested narration

> “The score answers whether this contact’s evidence passes our rules. Blast radius answers where the operational impact may spread. Arjun touches two departments and four workflows, with several high-impact relationships.”

---

## 13. Feature 10 — Read-only fix simulator

Open **Fix simulator**.

### First simulation

1. Select only `DPDP-001`.
2. Wait for the projected result.

Expected projection:

```text
Current:    35
Projected:  65
Delta:     +30
Status:     At Risk
```

### Second simulation

Select `DPDP-003` as well.

Expected projection:

```text
Current:    35
Projected:  85
Delta:     +50
Status:     Compliant
```

### Complete simulation

Select all three failed rules.

Expected projection:

```text
Current:    35
Projected: 100
Delta:     +65
Status:     Compliant
```

### Critical disclaimer

Point to the message stating that this is a read-only projection and no data is changed.

### Suggested narration

> “The simulator reuses exact rule deductions. Selecting a fix does not mark a rule as passed, change the contact, or modify the stored assessment. It only calculates a projection and records that the simulation happened.”

---

## 14. Feature 11 — Readiness advisor

Open **Readiness advisor**.

### Expected order for Arjun

1. Renew and record explicit consent — expected recovery: 30
2. Review, delete, or lawfully extend retained data — expected recovery: 20
3. Reduce collected fields and confirm minimization — expected recovery: 15

### What to explain

- Recommendations are created from failed rules.
- Priority is based on severity and recoverable points.
- Mistral does not generate or reorder these recommendations.

### Suggested narration

> “The readiness plan is also deterministic. The system prioritizes the highest-severity, highest-recovery issue first, so the operator gets an actionable sequence rather than a generic compliance paragraph.”

---

## 15. Feature 12 — Assessment history and trends

Open **History**.

### First-time expected state

After one run, the chart contains one score snapshot.

### Demonstrate retained history

1. Click **Run new assessment**.
2. Return to the History tab.
3. The chart should now include another assessment point.

Because the underlying evidence has not changed, the score remains 35. That flat result is useful: it proves that rerunning the same deterministic evidence produces the same outcome.

### Suggested narration

> “Assessments are never overwritten. Every run produces a timestamped snapshot, allowing the product to show posture over time and preserve what the engine decided on a specific date.”

### Important distinction

The fix simulator does not create a history point because it does not mutate evidence or create a new actual assessment.

---

## 16. Feature 13 — Grounded Mistral explainer

Open **Ask AI**.

### Establish the boundary first

Point to the banner explaining that AI answers from computed evidence and cannot change the decision.

### Recommended questions

Ask these one at a time:

1. `Why is this contact non-compliant?`
2. `Which DPDP rules failed?`
3. `What should we fix first?`
4. `How much will the score improve if consent is renewed?`

### What to listen for

The explanation should:

- Use the stored score and status.
- Refer only to the three failed rules.
- Use the persisted recommendation order.
- State that consent renewal recovers exactly 30 points in the simulation.
- Avoid inventing dates, facts, contacts, or legal interpretations.

### What happens for the consent what-if question

1. ComplyLens detects a consent score-improvement question.
2. It calls the deterministic simulator with `DPDP-001`.
3. The simulator returns the exact projection.
4. That projection is included in the JSON context sent to Mistral.
5. Mistral phrases the verified numbers in plain language.

### Suggested narration

> “Mistral is operating as an explainer, not an adjudicator. For a what-if question, even the arithmetic comes from the deterministic simulator before the model is called.”

### If Mistral is unavailable

Say:

> “The AI explanation layer is optional. Assessment, scoring, recommendations, simulation, audit, and reporting continue to work without it.”

Then continue with the audit trail.

---

## 17. Feature 14 — Rights-request tracker

Use the top navigation to open **Rights requests**.

### Create a request

1. Click **New request**.
2. Select a contact, for example Rahul Sharma.
3. Choose `access`, `correction`, `erasure`, or `grievance`.
4. Set the SLA to 72 hours.
5. Click **Create request**.

### What to show

- Contact name
- Request type
- SLA duration
- Hours remaining
- Open/overdue/completed visual state

### Complete the request

Click **Mark completed** and show the badge update.

### Suggested narration

> “ComplyLens is more than a point-in-time scanner. The rights tracker supports operational DPDP work with due dates and visible SLA status.”

---

## 18. Feature 15 — Audit trail

Use the top navigation to open **Audit trail**.

### Expected events after this walkthrough

- Multiple `assessment_run` events
- Several `fix_simulation` events
- `ai_question` events
- Matching `ai_answer` events

### Demonstrate filters

1. Filter by `assessment_run`.
2. Filter by `fix_simulation`.
3. Filter by `ai_question`.
4. Return to all events.
5. Search for a phrase or actor.

### What to point out

- Timestamp
- Event type
- Actor
- Stored event detail
- AI questions and answers are separate events

### Suggested narration

> “The audit trail closes the loop. We can show when a decision was run, which projection was tested, what a user asked the model, and what the model returned.”

---

## 19. Feature 16 — Compliance report export

Return to **Overview**.

### What to do

1. Click **Export report**.
2. Open the downloaded `complylens-report.csv` if appropriate for the audience.

### Expected columns

- Contact
- Email
- Department
- Score
- Status
- Violations
- Assessed at

### Suggested narration

> “The export creates a regulator- or auditor-ready snapshot of each contact’s latest assessment. It is generated from stored engine results, not from an AI summary.”

---

## 20. Feature 17 — Logout

Click the logout icon in the top-right corner.

### Expected result

- The session cookie is expired.
- The browser returns to `/login`.
- Attempting to open `/dashboard` redirects back to login.

### Suggested closing

> “ComplyLens combines deterministic DPDP checks, operational impact analysis, remediation planning, rights workflows, reporting, and grounded explanations in one auditable application. The engine always decides; AI only explains.”

---

## 21. Five-minute executive demo

When time is limited, use this exact sequence:

| Time | Action | Message |
|---:|---|---|
| 0:00–0:30 | Login | Internal protected workspace |
| 0:30–1:15 | Dashboard and run all | Real deterministic batch assessment |
| 1:15–2:15 | Open Arjun | Trace 35 points to three failed rules |
| 2:15–2:50 | Blast radius | Two departments, four workflows, high exposure |
| 2:50–3:35 | Fix simulator | Consent renewal adds exactly 30 points |
| 3:35–4:20 | Ask AI | Model explains verified simulator output |
| 4:20–4:50 | Audit trail | Assessments, simulations, questions, answers |
| 4:50–5:00 | Closing | “Engine decides; AI explains.” |

---

## 22. Full technical demo extension

After the UI walkthrough, open the source code in this order.

### 1. Pure rule evaluation

Open:

```text
lib/services/ruleEngine.ts
```

Show that each of the five results is derived from contact fields and related evidence. There is no database write and no AI call.

### 2. Score calculation

Open:

```text
lib/services/riskScoring.ts
```

Show the 100-point starting score, failed-rule deductions, zero floor, and status bands.

### 3. Assessment orchestration

Open:

```text
lib/services/assessmentService.ts
```

Show the sequence from contact fetch through persistence and audit insertion.

### 4. Read-only simulation

Open:

```text
lib/services/fixSimulator.ts
```

Show that projection returns numbers and does not update assessment or result tables.

### 5. AI boundary

Open:

```text
lib/services/aiExplainer.ts
```

Show the strict system prompt, controlled JSON context, optional simulator call, and separate audit events.

### 6. Database schema

Open:

```text
prisma/schema.prisma
```

Point out assessment history, results, recommendations, blast links, audit records, rights requests, incidents, users, and rule versions.

### 7. Automated tests

Run:

```powershell
npm.cmd test
```

Expected result:

```text
15 tests passed
```

Then explain that the most heavily tested area is the deterministic core, because it owns the compliance decision.

---

## 23. Optional API demonstration

Use an API client only after logging in and retaining the session cookie.

### Run an assessment

```http
POST /api/assessments/run
Content-Type: application/json

{
  "contactId": "CONTACT_ID"
}
```

### Simulate fixes

```http
POST /api/fix-simulator
Content-Type: application/json

{
  "assessmentId": "ASSESSMENT_ID",
  "ruleCodes": ["DPDP-001", "DPDP-003"]
}
```

### Ask the explainer

```http
POST /api/ai/ask
Content-Type: application/json

{
  "contactId": "CONTACT_ID",
  "question": "What should we fix first?"
}
```

### Export the latest report

```http
GET /api/reports
```

The complete endpoint reference is in `README.md`.

---

## 24. Common questions and suggested answers

### “Is the score generated by AI?”

No. `ruleEngine.ts` evaluates five explicit rules and `riskScoring.ts` performs the arithmetic. Mistral receives the result afterward.

### “Can Mistral change a failed rule?”

No. The AI service has no code path that updates assessment or result tables.

### “Why is Priya compliant if a rule failed?”

The status is determined by the total score band. Priya loses 20 points and finishes at 80, which maps to Compliant. The failed rule remains visible and produces a recommendation.

### “Does the simulator fix data?”

No. It is a read-only projection. It writes only an audit event describing the simulation.

### “What happens when evidence changes?”

Run another assessment. ComplyLens stores a new snapshot rather than overwriting the previous assessment, allowing score trends and historical evidence.

### “Is this legal advice?”

No. The app evaluates encoded organizational policy checks. Qualified privacy and legal professionals must validate the rules for real-world use.

### “Can we add more rules?”

Rule metadata and version history are already modeled. New executable rules must be implemented and tested deterministically before activation.

### “Can it support multiple roles?”

The user model includes a role field. Full department-level and auditor-specific authorization is a future extension.

### “Where is the backend?”

It is inside the Next.js application. `app/api` is the HTTP backend, `lib/services` is the business-logic backend, Prisma is the data-access layer, and PostgreSQL is the database.

---

## 25. Demo recovery guide

### The site does not open

1. Confirm Docker Desktop is running.
2. Run `docker start complylens-postgres`.
3. Run `npm.cmd run dev`.
4. Open `http://localhost:3000/login`.

### Login fails

Reset the demo database using the seed command, then use the default demo credentials.

### The dashboard shows “Not assessed”

Click **Run all assessments**. This is the expected state after reseeding.

### The first page takes time to load

Next.js compiles each route on its first development request. Wait for compilation to finish and refresh. A production build does not have this development-only delay.

### Mistral returns a configuration error

Confirm `MISTRAL_API_KEY` is present in `.env`, restart the dev server, and use a valid rotated key.

### Mistral is temporarily unavailable

Continue the demo with deterministic scoring, simulation, recommendations, audit, rights requests, and export. Describe the AI layer as optional.

### You need to restore the original data

Run the clean reset command from the preparation section, sign in again, and run the batch assessment.

---

## 26. Final presenter checklist

- [ ] Docker Desktop is running.
- [ ] `complylens-postgres` is running.
- [ ] The app opens at `http://localhost:3000`.
- [ ] Demo login works.
- [ ] Six contacts appear.
- [ ] Batch assessment produces the expected scores.
- [ ] Arjun shows score 35 and three failures.
- [ ] Arjun’s blast radius shows two departments and four workflows.
- [ ] Fix simulation shows exact score changes.
- [ ] Mistral answers a grounded question.
- [ ] Audit events appear.
- [ ] A rights request can be created and completed.
- [ ] CSV export downloads successfully.
- [ ] Browser notifications and unrelated tabs are closed.
- [ ] A fallback plan is ready if external AI is unavailable.

## One-line product message

> **ComplyLens turns DPDP evidence into deterministic decisions, prioritized remediation, operational impact, and auditable AI explanations.**
