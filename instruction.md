# MERN Compliance Management Platform – Cursor Setup Instructions

This document defines **how to work in Cursor IDE**, **project rules**, and **development steps** for the MERN-based Compliance Management Platform.

---

## 1. Purpose of `instruction.md`
This file is used by **Cursor AI** and developers to:
- Understand the project scope and rules
- Generate consistent code
- Avoid architectural and security mistakes
- Maintain uniform patterns across frontend and backend

You should keep this file updated and commit it to Git.

---

## 2. Technology Stack (Fixed)

### Frontend
- React 18
- React Router DOM
- Axios
- Tailwind CSS or Material UI

### Backend
- Node.js (>=18)
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer (email notifications)

### Infrastructure
- AWS S3 – document storage
- AWS IAM – S3 access
- MongoDB Atlas or self-hosted MongoDB

---

## 3. User Roles (RBAC Rules)

Roles must be enforced at **API level** and **UI level**.

- SUPER_ADMIN
- ADMIN
- LAB_OWNER
- LAB_TECHNICIAN

### Access Rules
- SUPER_ADMIN: Full system access
- ADMIN: Assigned labs only
- LAB_OWNER: All labs under ownership
- LAB_TECHNICIAN: Only assigned lab

---

## 4. Project Folder Structure

```
root
│
├── client/                 # React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── routes/
│   │   └── utils/
│   └── .env
│
├── server/                 # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   └── .env
│
├── instruction.md
├── .cursor/rules.md
└── README.md
```

---

## 5. Cursor Rules Configuration

Create a folder:
```
.cursor/
```

Create file:
```
.cursor/rules.md
```

### Cursor Rules Content

```
You are working on a MERN Compliance Management Platform.

Rules:
- Always follow MVC architecture
- Backend must be REST-based
- Use async/await only
- Validate all request payloads
- Enforce role-based access control
- Never hardcode secrets
- Use AWS S3 for document storage
- Maintain audit logs for all document actions
- Follow naming conventions consistently
- No business logic in routes
```

---

## 6. Database Design (High Level)

### Core Collections
- users
- labs
- machines
- documents
- documentUploads
- helpContents
- notifications
- auditLogs

### Example: User Model
```js
{
  name: String,
  email: String,
  password: String,
  role: String,
  assignedLabs: [ObjectId],
  status: Boolean
}
```

---

## 7. Authentication & Security Rules

- JWT-based authentication
- Password hashing using bcrypt
- Middleware for role authorization
- Token expiry: 24h

---

## 8. Document Workflow Rules

1. Admin defines documents
2. Documents assigned to labs via machines
3. Technician uploads document
4. Admin reviews
5. Approve or decline with feedback
6. History stored permanently

---

## 9. Notifications Rules

- Internal notification stored in DB
- Email notification via Nodemailer
- Triggered on:
  - Pending upload
  - Approval
  - Rejection

---

## 10. Audit Log Rules

Audit log must capture:
- User
- Action
- Entity
- Timestamp
- IP Address

Example actions:
- DOCUMENT_UPLOAD
- DOCUMENT_APPROVE
- DOCUMENT_REJECT
- USER_CREATE

---

## 11. Development Phases

### Phase 1 – Setup
- Repo setup
- Cursor rules
- Auth module

### Phase 2 – Admin Module
- User management
- Document definitions

### Phase 3 – Lab Module
- Upload workflow
- Dashboard

### Phase 4 – Notifications & Audit
- Email & internal notifications
- Audit log views

---

## 12. How to Use Cursor Effectively

Example prompt in Cursor:
```
Create Express CRUD APIs for document management.
Follow RBAC rules from instruction.md.
Include audit logging and validation.
```

---

## 13. Mandatory Practices

- Commit small changes
- Write reusable services
- Centralized error handling
- Use environment variables

---

## 14. Deployment Notes

- Backend runs on Node server
- S3 bucket private
- Signed URLs for download

---

## 15. Final Note

This file is the single source of truth.
Any AI-generated or developer-written code must follow this document.

