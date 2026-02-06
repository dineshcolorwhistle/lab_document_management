# 🚀 Quick Reference - Document Management System

## What's New? ✨

### For Lab Technicians
- 📅 **Applicable Date** field when uploading
- 💬 **Comments** field for additional notes
- 🏷️ **Status badges** (PENDING/APPROVED/REJECTED)
- 🔔 **Notifications** when documents are reviewed

### For Lab Owners
- 📄 **New Documents page** to view lab documents
- 🔍 **Filter by status**
- 👀 **See who uploaded** and when
- 🔔 **Notifications** for uploads and reviews

### For Admins
- 📄 **New Documents page** for all documents
- ✅ **Approve documents** with feedback
- ❌ **Reject documents** with required feedback
- 🔔 **Notifications** when documents are uploaded

### For Everyone
- 🔔 **Notification bell** in header
- 📬 **Notifications page** to manage all notifications
- ✉️ **Email notifications** (if configured)

---

## Quick Access

### URLs
- **Lab Technician Documents:** `/documents`
- **Lab Owner Documents:** `/lab-owner-documents`
- **Admin Documents:** `/admin-documents`
- **Notifications:** `/notifications`

### Menu Items
- **Notifications** - All users (bell icon)
- **Documents** - Role-specific (file icon)

---

## Document Status Flow

```
PENDING (🟡) → APPROVED (🟢)
             ↘ REJECTED (🔴)
```

- **PENDING:** Just uploaded, awaiting review
- **APPROVED:** Reviewed and accepted by Admin
- **REJECTED:** Reviewed and declined by Admin (with feedback)

---

## Notification Types

| Icon | Type | Triggered When | Sent To |
|------|------|----------------|---------|
| 📄 | Document Uploaded | Lab Technician uploads | Lab Owners + Admins |
| ✅ | Document Approved | Admin approves | Lab Owner + Lab Technician |
| ❌ | Document Rejected | Admin rejects | Lab Owner + Lab Technician |

---

## Quick Actions

### Upload a Document (Lab Technician)
1. Click "Upload Document" button
2. Fill in:
   - Document Name ✅ (required)
   - Machine Instance ✅ (required)
   - Document Template ✅ (required)
   - File ✅ (required)
   - Applicable Date (optional)
   - Comments (optional)
3. Submit → Status: PENDING

### Review a Document (Admin)
1. Go to Documents page
2. Find PENDING document
3. Click ✅ (Approve) or ❌ (Reject)
4. Add feedback
5. Submit → Notifications sent automatically

### Check Notifications (All Users)
1. Click 🔔 bell icon in header
2. See recent notifications
3. Click notification to mark as read
4. Click "View All" for full page

---

## Filters Available

### Lab Owner Documents
- Status: All / PENDING / APPROVED / REJECTED

### Admin Documents
- Status: All / PENDING / APPROVED / REJECTED

### Notifications
- All / Unread

---

## Email Configuration (Optional)

### Using Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@labmanagement.com
```

### Without Configuration
- Emails go to Ethereal test inbox
- Preview URLs appear in server console
- Click URL to view email in browser

---

## Troubleshooting

### Documents not showing?
- ✅ Check you're assigned to the lab (Lab Technician)
- ✅ Check you own the lab (Lab Owner)
- ✅ Refresh the page

### Notifications not appearing?
- ✅ Check the bell icon for unread count
- ✅ Go to /notifications page
- ✅ Check server console for errors

### Can't approve/reject?
- ✅ Must be Admin or Super Admin
- ✅ Document must be PENDING
- ✅ Feedback required for rejection

### Emails not sending?
- ✅ Check server console for Ethereal URLs
- ✅ Verify SMTP configuration in .env
- ✅ Check email service logs

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open notifications | Click bell icon |
| Close modal | ESC or click outside |
| Navigate pages | Use pagination buttons |

---

## File Upload Limits

- **Allowed Types:** PDF, DOCX, JPG, JPEG
- **Max Size:** 10MB
- **Validation:** Automatic

---

## Status Badge Colors

- 🟡 **PENDING** - Yellow background
- 🟢 **APPROVED** - Green background
- 🔴 **REJECTED** - Red background

---

## API Quick Reference

### Get Notifications
```bash
GET /api/notifications
Authorization: Bearer <token>
```

### Upload Document
```bash
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form fields:
- file (required)
- machineInstanceId (required)
- documentTemplateId (required)
- name (required)
- applicableDate (optional)
- comments (optional)
```

### Review Document
```bash
PATCH /api/documents/admin/documents/:id/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "APPROVED" | "REJECTED",
  "feedback": "Your feedback here"
}
```

---

## Support

### Documentation
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full feature list
- `TESTING_GUIDE.md` - How to test
- `ENHANCEMENTS_IMPLEMENTATION_PLAN.md` - Original plan

### Common Issues
1. **500 Error:** Check server logs
2. **401 Unauthorized:** Re-login
3. **403 Forbidden:** Check user role
4. **404 Not Found:** Verify route exists

---

## Features at a Glance

✅ Document upload with metadata  
✅ Status tracking (PENDING/APPROVED/REJECTED)  
✅ Role-based document access  
✅ Review and approval workflow  
✅ Internal notifications  
✅ Email notifications  
✅ Notification bell with unread count  
✅ Comprehensive notifications page  
✅ Filter and search capabilities  
✅ Pagination for large datasets  
✅ Beautiful, modern UI  
✅ Mobile responsive  
✅ Real-time updates  

---

## Version Info

- **Version:** 2.0.0
- **Release Date:** 2026-02-06
- **Status:** Production Ready ✅

---

**Need Help?** Check the documentation files or contact your system administrator.

**Happy Managing! 🎉**
