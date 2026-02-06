# Document Management System - Enhancements Implementation Plan

## Overview
This document outlines the implementation plan for enhancing the document management system with new features for different user roles and a comprehensive notification module.

## Phase 1: Database Schema Updates

### 1.1 Document Model Enhancements
**File**: `server/src/models/Document.js`

Add new fields:
- `applicableDate`: Date field for when the document becomes applicable
- `comments`: Text field for additional comments
- `status`: Enum field with values: PENDING, APPROVED, REJECTED
- `reviewedBy`: Reference to User who reviewed the document
- `reviewedAt`: Date when the document was reviewed
- `feedback`: Text field for admin/owner feedback
- `version`: Number field for version control (default: 1)
- `parentDocument`: Reference to parent document (for versioning)
- `versionHistory`: Array of version references

### 1.2 Notification Model (New)
**File**: `server/src/models/Notification.js`

Fields:
- `recipient`: Reference to User
- `type`: Enum (DOCUMENT_UPLOADED, DOCUMENT_APPROVED, DOCUMENT_REJECTED)
- `title`: String
- `message`: String
- `relatedDocument`: Reference to Document
- `relatedUser`: Reference to User (who triggered the notification)
- `read`: Boolean (default: false)
- `readAt`: Date
- `emailSent`: Boolean (default: false)
- `emailSentAt`: Date
- `metadata`: Mixed (flexible object for additional data)

## Phase 2: Backend Implementation

### 2.1 Enhanced Document Controller
**File**: `server/src/controllers/document.controller.js`

New/Updated Functions:
1. **uploadDocument** (Enhanced)
   - Add `applicableDate` and `comments` fields
   - Set initial status to PENDING
   - Trigger notifications to Lab Owner and Admins

2. **getDocumentsForLabOwner** (New)
   - Filter documents by labs owned by the user
   - Include all document details with status
   - Support pagination and filtering

3. **getDocumentsForAdmin** (New)
   - Return all documents across all labs
   - Include comprehensive details
   - Support filtering by lab, machine, status, etc.

4. **reviewDocument** (New)
   - Admin/Super Admin can approve/reject documents
   - Add feedback
   - Update status
   - Trigger notifications to Lab Owner and Lab Technician

5. **getDocumentVersionHistory** (New)
   - Return all versions of a document
   - Show version timeline

6. **createDocumentVersion** (New)
   - Create a new version of an existing document
   - Link to parent document
   - Increment version number

### 2.2 Notification Controller (New)
**File**: `server/src/controllers/notification.controller.js`

Functions:
1. **createNotification**
   - Create notification record
   - Send email notification
   - Handle different notification types

2. **getMyNotifications**
   - Get notifications for logged-in user
   - Support pagination
   - Filter by read/unread status

3. **markAsRead**
   - Mark notification as read
   - Update readAt timestamp

4. **markAllAsRead**
   - Mark all user notifications as read

5. **getUnreadCount**
   - Return count of unread notifications

### 2.3 Email Service (New)
**File**: `server/src/services/email.service.js`

Functions:
1. **sendDocumentUploadedEmail**
   - Notify Lab Owner and Admins
   - Include document details

2. **sendDocumentReviewedEmail**
   - Notify Lab Owner and Lab Technician
   - Include review decision and feedback

3. **sendEmail** (Generic)
   - Handle email sending via SMTP/service

### 2.4 Routes Updates

**File**: `server/src/routes/document.routes.js`
- Add routes for Lab Owner and Admin document access
- Add review endpoint
- Add version history endpoints

**File**: `server/src/routes/notification.routes.js` (New)
- GET /api/notifications - Get user notifications
- PATCH /api/notifications/:id/read - Mark as read
- PATCH /api/notifications/read-all - Mark all as read
- GET /api/notifications/unread-count - Get unread count

## Phase 3: Frontend Implementation

### 3.1 Lab Technician Enhancements
**File**: `client/src/pages/DocumentsPage.jsx`

Updates:
- Add Applicable Date field (date picker)
- Add Comments field (textarea)
- Add Status column in document list
- Update document list to show status badges

### 3.2 Lab Owner Document Page (New)
**File**: `client/src/pages/LabOwnerDocumentsPage.jsx`

Features:
- Document list filtered by owned labs
- Lab filter dropdown
- Display columns:
  - Document name
  - Uploaded by
  - Last updated date
  - Status
  - Machine instance
  - Document type
- View document details
- Pagination

### 3.3 Admin Document Management Page (New)
**File**: `client/src/pages/AdminDocumentsPage.jsx`

Features:
- All documents across all labs
- Advanced filtering:
  - Lab
  - Machine instance
  - Status
  - Document type
  - Date range
- Display columns:
  - Document name
  - Uploaded by
  - Last updated date
  - Status
  - Machine instance
  - Associated lab
  - Document type
- Review functionality (approve/reject with feedback)
- Version history view
- Pagination

### 3.4 Notification System
**File**: `client/src/components/NotificationBell.jsx` (New)

Features:
- Bell icon with unread count badge
- Dropdown showing recent notifications
- Mark as read functionality
- Link to full notifications page

**File**: `client/src/pages/NotificationsPage.jsx` (New)

Features:
- List all notifications
- Filter by read/unread
- Mark all as read
- Pagination
- Click to view related document

### 3.5 Services

**File**: `client/src/services/document.js`
- Add methods for new endpoints
- Review document
- Get version history

**File**: `client/src/services/notification.js` (New)
- Get notifications
- Mark as read
- Get unread count

## Phase 4: UI/UX Enhancements

### 4.1 Status Badges
Create reusable status badge component:
- PENDING: Yellow/Orange
- APPROVED: Green
- REJECTED: Red

### 4.2 Date Picker Component
- Use a date picker library or custom component
- For Applicable Date field

### 4.3 Review Modal
- Modal for admins to review documents
- Approve/Reject buttons
- Feedback textarea
- Document preview

### 4.4 Version History Modal
- Timeline view of document versions
- Show version number, date, uploaded by
- Download/view each version

## Phase 5: Access Control & Permissions

### 5.1 Role-Based Access
- LAB_TECHNICIAN: Upload documents, view own documents
- LAB_OWNER: View documents from owned labs
- ADMIN/SUPER_ADMIN: View all documents, review documents

### 5.2 Middleware Updates
**File**: `server/src/middlewares/authorize.js`
- Ensure proper role checking for new endpoints

## Phase 6: Email Configuration

### 6.1 Environment Variables
Add to `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@labmanagement.com
SMTP_FROM_NAME=Lab Management System
```

### 6.2 Email Templates
Create HTML email templates:
- Document uploaded notification
- Document approved notification
- Document rejected notification

## Implementation Order

### Sprint 1: Database & Backend Core
1. Update Document model
2. Create Notification model
3. Update document controller with new fields
4. Create notification controller
5. Create email service
6. Update routes

### Sprint 2: Lab Technician Enhancements
1. Update DocumentsPage with new fields
2. Add status column
3. Test upload workflow

### Sprint 3: Lab Owner Features
1. Create LabOwnerDocumentsPage
2. Add document filtering by owned labs
3. Add to menu and routes
4. Test access control

### Sprint 4: Admin Features
1. Create AdminDocumentsPage
2. Implement review functionality
3. Add version control
4. Test review workflow

### Sprint 5: Notification System
1. Create NotificationBell component
2. Create NotificationsPage
3. Integrate with header/layout
4. Test notification flow

### Sprint 6: Email Integration
1. Configure email service
2. Create email templates
3. Test email sending
4. Handle email failures gracefully

### Sprint 7: Testing & Polish
1. End-to-end testing for all roles
2. UI/UX refinements
3. Performance optimization
4. Documentation updates

## Testing Checklist

### Lab Technician
- [ ] Can add Applicable Date when uploading
- [ ] Can add Comments when uploading
- [ ] Can see Status column in document list
- [ ] Status shows as PENDING after upload
- [ ] Receives notification when document is reviewed

### Lab Owner
- [ ] Can access Documents menu
- [ ] Sees only documents from owned labs
- [ ] Can filter by lab
- [ ] Can view document details
- [ ] Receives notification when document is uploaded

### Admin/Super Admin
- [ ] Can access Documents menu
- [ ] Sees all documents across all labs
- [ ] Can filter by multiple criteria
- [ ] Can review documents (approve/reject)
- [ ] Can provide feedback
- [ ] Can view version history
- [ ] Receives notification when document is uploaded

### Notifications
- [ ] Internal notifications created correctly
- [ ] Email notifications sent successfully
- [ ] Notification bell shows unread count
- [ ] Can mark notifications as read
- [ ] Can view all notifications
- [ ] Notifications link to related documents

## Database Migration Notes

No migration required for existing data. New fields will be:
- `applicableDate`: Optional (can be null for existing documents)
- `comments`: Optional (can be empty for existing documents)
- `status`: Default to APPROVED for existing documents
- `version`: Default to 1 for existing documents

## Security Considerations

1. Validate file uploads (type, size, malware scanning)
2. Ensure proper access control for all endpoints
3. Sanitize user inputs (comments, feedback)
4. Rate limiting for email notifications
5. Secure email credentials in environment variables
6. Validate date inputs
7. Prevent unauthorized document access
8. Audit trail for document reviews

## Performance Considerations

1. Index frequently queried fields (status, lab, uploadedBy)
2. Pagination for large document lists
3. Lazy loading for version history
4. Email queue for bulk notifications
5. Cache notification counts
6. Optimize database queries with proper population

## Future Enhancements (Out of Scope)

1. Document preview in browser
2. Advanced search with full-text indexing
3. Bulk document operations
4. Document expiration reminders
5. Analytics dashboard
6. Document templates with fillable forms
7. Digital signatures
8. Audit logs
9. Export reports to PDF/Excel
10. Mobile app support
