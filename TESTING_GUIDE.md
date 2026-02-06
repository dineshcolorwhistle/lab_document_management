# Quick Start Guide - Testing Document Enhancements

## What's Been Implemented

### ✅ Backend (100% Complete)
- Document upload with Applicable Date and Comments
- Document status workflow (PENDING → APPROVED/REJECTED)
- Notification system (internal + email)
- Lab Owner document access
- Admin document review functionality
- Version control foundation

### ✅ Frontend (Lab Technician - 100% Complete)
- Upload form with new fields
- Status badges in document list
- Enhanced UI

## How to Test Right Now

### 1. Test Lab Technician Upload (Ready Now!)

**Steps:**
1. Login as a Lab Technician
2. Go to Documents page
3. Click "Upload Document"
4. Fill in the form:
   - Document Name (required)
   - Select Machine Instance (required)
   - Select Document Template (required)
   - Upload File (required)
   - **NEW:** Applicable Date (optional)
   - **NEW:** Comments (optional)
5. Submit

**Expected Result:**
- Document uploads successfully
- Status shows as "PENDING" (yellow badge)
- Notifications are created for Lab Owners and Admins
- Emails are sent (check console for Ethereal preview URL if SMTP not configured)

### 2. Test Backend API Endpoints

You can test these using Postman, curl, or browser dev tools:

#### Get My Documents (Lab Technician)
```
GET /api/documents/my-documents
Authorization: Bearer <token>
```

#### Get Lab Owner Documents
```
GET /api/documents/lab-owner/documents?labId=<labId>&status=PENDING
Authorization: Bearer <token>
```

#### Get All Documents (Admin)
```
GET /api/documents/admin/documents?status=PENDING
Authorization: Bearer <token>
```

#### Review Document (Admin)
```
PATCH /api/documents/admin/documents/<documentId>/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "APPROVED",
  "feedback": "Document looks good!"
}
```

#### Get Notifications
```
GET /api/notifications
Authorization: Bearer <token>
```

#### Get Unread Count
```
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

### 3. Check Email Notifications

If SMTP is not configured, the system uses Ethereal (test email service):

1. Upload a document as Lab Technician
2. Check server console logs
3. Look for lines like:
   ```
   [email:ethereal] Message sent. Preview: https://ethereal.email/message/...
   ```
4. Click the URL to view the email in browser

### 4. Verify Database Changes

Connect to MongoDB and check:

```javascript
// Check documents have new fields
db.documents.findOne()
// Should show: applicableDate, comments, status, version, isLatestVersion

// Check notifications were created
db.notifications.find()
// Should show notifications for document upload
```

## What's NOT Ready Yet (Frontend)

These features are backend-ready but need frontend pages:

1. **Lab Owner Documents Page** - Can access via API, no UI yet
2. **Admin Documents Page** - Can access via API, no UI yet
3. **Notification Bell** - Notifications work via API, no UI component yet
4. **Notifications Page** - Can access via API, no UI yet
5. **Review Modal** - Can review via API, no UI yet

## Quick API Testing Script

Save this as `test-api.js` and run with `node test-api.js`:

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = 'YOUR_TOKEN_HERE'; // Get from login

async function testAPIs() {
  try {
    // Test get my documents
    const docs = await axios.get(`${API_URL}/documents/my-documents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('My Documents:', docs.data);

    // Test get notifications
    const notifications = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Notifications:', notifications.data);

    // Test unread count
    const unreadCount = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Unread Count:', unreadCount.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPIs();
```

## Email Configuration (Optional)

### For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@labmanagement.com
```

### For Other Providers:
Check your email provider's SMTP settings and update `.env` accordingly.

## Troubleshooting

### Document Upload Fails
- Check file size (max 10MB)
- Check file type (PDF, DOCX, JPG only)
- Verify machine instance belongs to your assigned lab

### Notifications Not Created
- Check server console for errors
- Verify Lab has labOwners assigned
- Check if Admin users exist with ACTIVE status

### Emails Not Sending
- If SMTP not configured, emails go to Ethereal (test mode)
- Check console for preview URLs
- Verify SMTP credentials if using real email

### Status Not Showing
- Refresh the page
- Check browser console for errors
- Verify backend returned status field

## Next Development Steps

To complete the implementation, create these frontend components:

1. **Notification Service** (`client/src/services/notification.js`)
2. **NotificationBell Component** (`client/src/components/NotificationBell.jsx`)
3. **NotificationsPage** (`client/src/pages/NotificationsPage.jsx`)
4. **LabOwnerDocumentsPage** (`client/src/pages/LabOwnerDocumentsPage.jsx`)
5. **AdminDocumentsPage** (`client/src/pages/AdminDocumentsPage.jsx`)
6. **Update Routes** (`client/src/routes/AppRoutes.jsx`)
7. **Update Menu** (`client/src/config/menu.js`)

## Support

For issues or questions:
1. Check `IMPLEMENTATION_STATUS.md` for detailed status
2. Check `ENHANCEMENTS_IMPLEMENTATION_PLAN.md` for full plan
3. Review server console logs for errors
4. Check browser console for frontend errors

---

**Happy Testing! 🚀**
