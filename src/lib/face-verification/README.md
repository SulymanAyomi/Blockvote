# Face Verification — Frontend + Orchestration Layer

Next.js (App Router) frontend and orchestration for a student government election
face-verification MVP. This service does **not** do face matching itself — it
calls out to a separate Python/FastAPI microservice for that.

## Setup

```bash
npm install @mediapipe/tasks-vision
```

Copy `.env.example` to `.env.local` and fill in:

```
FACE_SERVICE_URL=http://localhost:8000          # never exposed to the client
SESSION_SECRET=replace-with-a-long-random-string
VERIFY_THRESHOLD_APPROVE=0.75
VERIFY_THRESHOLD_REVIEW=0.55
NEXT_PUBLIC_COMMITTEE_CONTACT_URL=mailto:elections@college.edu
```

## Assumed contract with the Python microservice

`POST {FACE_SERVICE_URL}/verify`

```json
// request
{ "liveImageBase64": "...", "referenceDescriptor": [0.12, 0.98, ...] }

// response
{ "similarity": 0.83, "faceDetected": true }
```

`POST {FACE_SERVICE_URL}/encode` (used at registration time, not by this app directly)

```json
// request
{ "imageBase64": "..." }

// response
{ "descriptor": [0.12, 0.98, ...] }
```

If your actual service's shapes differ, the only place that needs to change is
`lib/verification/pythonServiceClient.ts`.

## Thresholds

Defined in `lib/verification/types.ts`, overridable via env:

| Similarity | Outcome |
|---|---|
| ≥ `VERIFY_THRESHOLD_APPROVE` (default 0.75) | approved |
| ≥ `VERIFY_THRESHOLD_REVIEW` (default 0.55) | manual_review |
| below that | rejected |

## Session handling

A signed httpOnly cookie (`lib/verification/session.ts`) tracks one voting
session's status (`pending` / `approved` / `manual_review` / `rejected`).
`/api/verify` refuses to re-run verification once a session is `approved`
(returns 409). This is intentionally simple — swap for real auth/session
infra when you have one.

## Known MVP shortcuts to revisit

- `data/students.json` stands in for the registrar DB (`lib/verification/mockStudentDb.ts`).
- Session store is a single signed cookie, not a server-side session table —
  fine for one browser/session but doesn't prevent someone from clearing
  cookies and retrying. Add server-side session state (Redis/DB) before
  relying on this for a real election.
- No rate limiting on `/api/verify`.
- `useFaceDetection` loads MediaPipe's model from Google's CDN at runtime —
  consider self-hosting the `.task` file and wasm bundle for reliability/offline use.

## File structure

```
app/verify/page.tsx          Verify page (thin wrapper)
app/vote/page.tsx            Placeholder post-approval page, session-guarded
app/api/verify/route.ts      Orchestration: session guard → DB lookup → Python call

components/verification/
  VerificationFlow.tsx        Orchestrator, composes everything below
  CameraCapture.tsx            getUserMedia + stream lifecycle/cleanup
  FaceGuideOverlay.tsx         Oval SVG guide
  StudentIdForm.tsx            Student ID entry gate
  ResultApproved.tsx
  ResultManualReview.tsx
  ResultRejected.tsx

hooks/
  useVerificationMachine.ts   Explicit state machine (useReducer)
  useFaceDetection.ts          MediaPipe Face Mesh wrapper

lib/verification/
  types.ts                    Shared types/enums/thresholds
  session.ts                  Signed cookie helpers
  mockStudentDb.ts             JSON-backed lookup
  pythonServiceClient.ts       Server-only fetch to FACE_SERVICE_URL

data/students.json            Mock registrar data
```
