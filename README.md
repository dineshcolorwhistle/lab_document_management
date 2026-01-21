# MERN Compliance Management Platform (Lab Document Management)

Role-based compliance document management for laboratories: define required documents, assign them to labs/machines, collect uploads, review/approve/reject, notify stakeholders, and keep immutable audit history.

## Scope (what this app does)
- **Document definitions**: Admin creates required document types.
- **Assignment**: Documents are assigned to labs via machines.
- **Upload workflow**: Lab Technician uploads required documents for review.
- **Review workflow**: Admin reviews and **approves** or **rejects with feedback**.
- **History**: Upload and decision history is stored permanently.
- **Audit logging**: Every document action is recorded (who/what/when/from where).
- **Notifications**: In-app notifications + email notifications (Nodemailer).

## Roles (RBAC)
RBAC must be enforced at **API level** and **UI level**.

- **SUPER_ADMIN**: Full system access
- **ADMIN**: Assigned labs only
- **LAB_OWNER**: All labs under ownership
- **LAB_TECHNICIAN**: Only assigned lab

## Tech stack (fixed)
### Frontend
- React 18
- React Router DOM
- Axios
- Tailwind CSS or Material UI

### Backend
- Node.js >= 18
- Express.js (REST)
- MongoDB + Mongoose
- JWT Authentication (token expiry: 24h)
- bcrypt password hashing
- Nodemailer for email notifications

### Infrastructure
- AWS S3 for document storage (private bucket)
- AWS IAM for S3 access
- Signed URLs for secure downloads

## Data model (high level)
Core collections:
`users`, `labs`, `machines`, `documents`, `documentUploads`, `helpContents`, `notifications`, `auditLogs`.

Audit log must capture: **user**, **action**, **entity**, **timestamp**, **IP address**.

## Repository structure
Planned structure (source of truth: `instruction.md`):

```
root
├── client/                 # React App
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── routes/
│       └── utils/
├── server/                 # Express API
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middlewares/
│       ├── services/
│       ├── utils/
│       └── app.js
├── instruction.md          # Project rules + scope
└── .cursor/rules.md        # Cursor rules for consistent generation
```

## Development rules (must follow)
From `instruction.md` / `.cursor/rules.md`:
- Use **MVC architecture**
- Routes are thin: **no business logic in routes**
- Use **async/await** consistently
- Validate all request payloads
- Enforce RBAC everywhere
- Never hardcode secrets (use environment variables)
- Use S3 for document storage
- Maintain audit logs for all document actions

## Getting started (local)
Prerequisites:
- Node.js >= 18
- MongoDB (local or Atlas)
- AWS credentials with access to your S3 bucket (for document storage)

Install dependencies (once `client/` and `server/` exist):

```bash
cd server && npm install
cd ../client && npm install
```

Run locally (typical approach):

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm start
```

## Configuration
Environment variables must be stored in `.env` files (do **not** commit secrets).

Typical values you will need:
- **Server**: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `SMTP_*`
- **Client**: `VITE_API_URL` or `REACT_APP_API_URL` (depending on build tooling)

### Forgot password (reset link)
- **Server**: set `APP_BASE_URL` to your frontend URL (used to generate reset links), e.g. `http://localhost:5173`
- **Optional email (SMTP)**: if SMTP env vars are not set, the server will **log** the reset link instead of sending email.
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### `.env` gotcha (important)
- **If a value contains `#`, wrap it in quotes**. In `.env` files, `#` starts a comment.
  - Example:
    - ✅ `SEED_SUPER_ADMIN_PASSWORD="admin@#12312"`
    - ❌ `SEED_SUPER_ADMIN_PASSWORD=admin@#12312` (this becomes `admin@`)

### Seed a SUPER_ADMIN (local / Atlas)
From `server/`, set these in `server/.env` (do not commit):

```bash
SEED_SUPER_ADMIN_NAME=name
SEED_SUPER_ADMIN_EMAIL=email
SEED_SUPER_ADMIN_PASSWORD="pwd"
SEED_SUPER_ADMIN_ROLE=role
SEED_SUPER_ADMIN_FORCE_PASSWORD=true
```

Then run:

```bash
cd server
npm run seed:superadmin
```

## Project phases (roadmap)
- **Phase 1**: Repo setup, Cursor rules, Auth module
- **Phase 2**: Admin module (user management, document definitions)
- **Phase 3**: Lab module (upload workflow, dashboard)
- **Phase 4**: Notifications & audit (email + internal notifications, audit log views)

## Notes
- `instruction.md` is the single source of truth for scope and rules.
- Keep changes small and reusable; use centralized error handling.
