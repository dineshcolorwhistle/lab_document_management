# 🎯 Super Admin - How to View Documents

## ✅ **Super Admin CAN View Documents!**

The system is **already configured** for Super Admin to view all documents. Here's how:

---

## 📍 **Navigation**

### **Step 1: Login as Super Admin**
- Use your Super Admin credentials
- Login at: `http://localhost:5173/login`

### **Step 2: Access Documents Page**
After login, you have **two ways** to access documents:

#### **Option A: Via Sidebar Menu**
1. Look at the left sidebar
2. Click on **"Documents"** (📄 icon)
3. You'll be taken to `/admin-documents`

#### **Option B: Direct URL**
- Navigate directly to: `http://localhost:5173/admin-documents`

---

## 📊 **What You'll See**

### **Admin Documents Page Features:**

1. **All Documents Across All Labs** ✅
   - See every document uploaded by any Lab Technician
   - From all labs in the system

2. **Filtering Options** 🔍
   - **Status Filter:** All / PENDING / APPROVED / REJECTED
   - More filters available in the UI

3. **Document Information** 📋
   - Document name
   - Uploaded by (technician name & email)
   - Lab name
   - Machine instance details
   - Document type
   - Status (with color-coded badges)
   - Upload date
   - Applicable date
   - Comments

4. **Review Actions** ✅❌
   - **Approve** button (green checkmark) for PENDING documents
   - **Reject** button (red X) for PENDING documents
   - Add feedback when reviewing

5. **Pagination** 📄
   - Navigate through multiple pages if many documents

---

## 🎨 **Status Badges**

Documents show color-coded status:
- 🟡 **PENDING** - Yellow badge (awaiting review)
- 🟢 **APPROVED** - Green badge (approved by admin)
- 🔴 **REJECTED** - Red badge (rejected with feedback)

---

## ⚡ **Quick Actions**

### **To Approve a Document:**
1. Find a PENDING document
2. Click the green ✅ **Approve** button
3. Add optional feedback
4. Click "Approve Document"
5. ✅ Notifications sent automatically to Lab Owner & Technician

### **To Reject a Document:**
1. Find a PENDING document
2. Click the red ❌ **Reject** button
3. Add **required** feedback (explain why)
4. Click "Reject Document"
5. ❌ Notifications sent automatically to Lab Owner & Technician

---

## 🔔 **Notifications**

As Super Admin, you receive notifications for:
- 📤 **New document uploads** (from any lab)
- Click the bell icon (🔔) in the header to view

---

## 🛠️ **Troubleshooting**

### **"Documents" menu not showing?**
✅ **Check:** Are you logged in as SUPER_ADMIN role?
- Go to Profile (top right) → Check your role
- Should show "Super Admin"

### **Can't see any documents?**
✅ **Possible reasons:**
1. No documents have been uploaded yet
2. All documents are filtered out (check filter settings)
3. Try clicking "Clear All" filters

### **Can't approve/reject?**
✅ **Check:**
- Document must be in PENDING status
- Only PENDING documents show action buttons

---

## 📱 **Mobile Access**

The page is fully responsive:
- Works on tablets and phones
- Swipe to scroll table horizontally
- All features available

---

## 🎯 **Permissions**

As **Super Admin**, you have:
- ✅ View ALL documents (across all labs)
- ✅ Approve documents
- ✅ Reject documents
- ✅ Add feedback
- ✅ View version history (when implemented)
- ✅ Access all filters

---

## 📊 **Example Workflow**

1. **Lab Technician uploads document** → Status: PENDING
2. **Super Admin receives notification** 🔔
3. **Super Admin goes to Documents page**
4. **Reviews the document**
5. **Approves or Rejects** with feedback
6. **Lab Technician & Lab Owner notified** ✉️

---

## 🚀 **Quick Access URLs**

| Page | URL |
|------|-----|
| Login | `http://localhost:5173/login` |
| Documents | `http://localhost:5173/admin-documents` |
| Notifications | `http://localhost:5173/notifications` |
| Dashboard | `http://localhost:5173/dashboard` |

---

## ✅ **Verification Steps**

To verify everything is working:

1. **Login as Super Admin** ✅
2. **Check sidebar** - Should see "Documents" menu ✅
3. **Click Documents** - Opens admin documents page ✅
4. **See document list** - Shows all uploaded documents ✅
5. **Try filtering** - Filter by status works ✅
6. **Review a document** - Approve/Reject buttons work ✅

---

## 📝 **Notes**

- **Backend Route:** `GET /api/documents/admin/documents`
- **Frontend Page:** `AdminDocumentsPage.jsx`
- **Menu Config:** Configured in `menu.js`
- **Role Required:** `SUPER_ADMIN` or `ADMIN`

---

## 🎉 **You're All Set!**

Super Admin document viewing is **fully functional**. Just login and click "Documents" in the sidebar!

**Need help?** Check the console for any errors or contact support.

---

**Last Updated:** 2026-02-06  
**Status:** ✅ Working  
**Version:** 2.0.0
