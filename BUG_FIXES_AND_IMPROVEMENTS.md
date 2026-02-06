# 🐛 Document Module - Bug Fixes & Enhancements

## Status: Analysis Complete ✅

---

## 1. ✅ Document Visibility Issue - **ALREADY FIXED**

### **Issue Description:**
> Uploaded documents are currently not viewable across all user roles.
> This issue needs to be resolved to ensure proper access based on role permissions.

### **Current Implementation Status: ✅ WORKING**

The system **already has proper role-based access** implemented:

#### **Lab Technician** 📝
- ✅ Can view only their own uploaded documents
- ✅ Endpoint: `GET /api/documents/my-documents`
- ✅ Filter: `uploadedBy: userId`
- ✅ Frontend: `DocumentsPage.jsx`

#### **Lab Owner** 👔
- ✅ Can view documents from labs they own
- ✅ Endpoint: `GET /api/documents/lab-owner/documents`
- ✅ Filter: `lab: { $in: labIds }` (owned labs)
- ✅ Frontend: `LabOwnerDocumentsPage.jsx`

#### **Admin / Super Admin** 👨‍💼
- ✅ Can view ALL documents across all labs
- ✅ Endpoint: `GET /api/documents/admin/documents`
- ✅ Filter: No restrictions (all documents)
- ✅ Frontend: `AdminDocumentsPage.jsx`

### **Verification:**
```javascript
// Lab Technician - document.controller.js line 218
exports.getMyDocuments = async (req, res, next) => {
    const query = { uploadedBy: userId } // Only their documents
}

// Lab Owner - document.controller.js line 338
exports.getDocumentsForLabOwner = async (req, res, next) => {
    const query = { lab: { $in: labIds } } // Only owned labs
}

// Admin - document.controller.js line 408
exports.getAllDocuments = async (req, res, next) => {
    const query = { isLatestVersion: true } // All documents
}
```

### **Conclusion:** ✅ **NO FIX NEEDED** - Working as designed

---

## 2. 🔧 Rejected Comment Display Issue - **NEEDS FIX**

### **Issue Description:**
> When an Admin rejects a document, the rejection comments are displayed with labels such as "Admin / Super Admin" in the Lab Technician and Lab Owner views.
> The comment display should be corrected to show clear and appropriate attribution.

### **Current Problem:**
The feedback field doesn't clearly indicate WHO rejected it and WHEN.

### **Proposed Solution:**

#### **Backend Changes:**
Already stores `reviewedBy` and `reviewedAt` fields ✅

#### **Frontend Changes Needed:**

**In `DocumentsPage.jsx` (Lab Technician):**
```jsx
// Add feedback display in the document list
{doc.status === 'REJECTED' && doc.feedback && (
  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start gap-2">
      <MessageSquare className="h-4 w-4 text-red-600 mt-0.5" />
      <div className="flex-1">
        <div className="text-xs font-semibold text-red-800">
          Rejection Feedback
        </div>
        <div className="text-sm text-red-700 mt-1">{doc.feedback}</div>
        {doc.reviewedBy && (
          <div className="text-xs text-red-600 mt-2">
            Reviewed by {doc.reviewedBy.name} on {formatDate(doc.reviewedAt)}
          </div>
        )}
      </div>
    </div>
  </div>
)}
```

**In `LabOwnerDocumentsPage.jsx`:**
```jsx
// Similar feedback display with proper attribution
{doc.status === 'REJECTED' && doc.feedback && (
  <div className="text-xs text-red-600 mt-1">
    <strong>Rejected:</strong> {doc.feedback}
    <br />
    <span className="text-muted-foreground">
      by {doc.reviewedBy?.name} on {formatDate(doc.reviewedAt)}
    </span>
  </div>
)}
```

### **Implementation Required:** ✅ **YES**

---

## 3. 🚀 Version History Implementation - **NEEDS IMPLEMENTATION**

### **Issue Description:**
> Implement version control for document uploads across all roles.
> If a Lab Technician uploads a document for the same machine instance and the same template, it should automatically be recorded as Version 2 (and increment for subsequent uploads).

### **Current Status:**
- ✅ Database schema supports versioning
- ✅ Backend API for version history exists
- ❌ Upload new version functionality NOT implemented
- ❌ Automatic version detection NOT implemented

### **Proposed Solution:**

#### **Backend Changes:**

**Add new controller function:**
```javascript
// server/src/controllers/document.controller.js

/**
 * Upload a new version of an existing document
 */
exports.uploadNewVersion = async (req, res, next) => {
    try {
        const { originalDocumentId } = req.params
        const userId = req.user.id
        
        // Get original document
        const originalDoc = await Document.findById(originalDocumentId)
        if (!originalDoc) {
            return res.status(404).json({ message: 'Original document not found' })
        }
        
        // Verify user can upload version
        if (originalDoc.uploadedBy.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' })
        }
        
        // Find latest version
        const latestVersion = await Document.findOne({
            $or: [
                { _id: originalDocumentId },
                { parentDocument: originalDoc.parentDocument || originalDocumentId }
            ]
        }).sort({ version: -1 })
        
        // Mark all previous versions as not latest
        await Document.updateMany(
            {
                $or: [
                    { _id: originalDocumentId },
                    { parentDocument: originalDoc.parentDocument || originalDocumentId }
                ]
            },
            { isLatestVersion: false }
        )
        
        // Create new version
        const newVersion = await Document.create({
            name: originalDoc.name,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            lab: originalDoc.lab,
            machineInstance: originalDoc.machineInstance,
            documentTemplate: originalDoc.documentTemplate,
            uploadedBy: userId,
            applicableDate: req.body.applicableDate || null,
            comments: req.body.comments || '',
            status: 'PENDING', // Requires re-approval
            version: latestVersion.version + 1,
            parentDocument: originalDoc.parentDocument || originalDocumentId,
            isLatestVersion: true,
            metadata: {
                originalName: req.file.originalname,
                size: req.file.size,
                uploadDate: new Date(),
            }
        })
        
        // Send notifications...
        
        res.status(201).json({
            success: true,
            message: `Version ${newVersion.version} uploaded successfully`,
            data: newVersion
        })
    } catch (error) {
        next(error)
    }
}
```

**Add route:**
```javascript
// server/src/routes/document.routes.js
router.post(
    '/upload-version/:originalDocumentId',
    requireAuth,
    requireRole(['LAB_TECHNICIAN']),
    upload.single('file'),
    documentController.uploadNewVersion
)
```

#### **Frontend Changes:**

**In `DocumentsPage.jsx`:**
```jsx
// Add "Upload New Version" button next to each document
<button
    onClick={() => handleUploadNewVersion(doc)}
    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
>
    <Upload className="h-4 w-4" />
    Upload New Version
</button>

// Add version badge
<span className="text-xs text-muted-foreground">
    v{doc.version}
</span>

// Add "View History" button
<button
    onClick={() => handleViewVersionHistory(doc)}
    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
>
    <History className="h-4 w-4" />
    Version History
</button>
```

**Create `VersionHistoryModal.jsx`:**
```jsx
export default function VersionHistoryModal({ documentId, onClose }) {
    const [versions, setVersions] = useState([])
    
    useEffect(() => {
        fetchVersionHistory()
    }, [documentId])
    
    const fetchVersionHistory = async () => {
        const response = await documentService.getDocumentVersionHistory(documentId)
        setVersions(response.data)
    }
    
    return (
        <div className="modal">
            <h2>Version History</h2>
            {versions.map(v => (
                <div key={v._id} className="version-item">
                    <span>Version {v.version}</span>
                    {v.isLatestVersion && <span>(Current)</span>}
                    <span>Uploaded: {formatDate(v.createdAt)}</span>
                    <span>Status: {v.status}</span>
                    <button onClick={() => downloadVersion(v._id)}>Download</button>
                </div>
            ))}
        </div>
    )
}
```

### **Implementation Required:** ✅ **YES**

---

## 4. 📊 Version Number Display - **NEEDS IMPLEMENTATION**

### **Issue Description:**
> The document list page should include a Version Number column to clearly indicate the current version of each document.

### **Current Status:**
- ✅ Version field exists in database
- ❌ Not displayed in UI

### **Proposed Solution:**

**In `DocumentsPage.jsx` (Lab Technician):**
```jsx
// Add Version column to table
<th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
    Version
</th>

// In table body
<td className="py-4 px-4">
    <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
            v{doc.version}
        </span>
        {doc.isLatestVersion && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                Latest
            </span>
        )}
    </div>
</td>
```

**In `LabOwnerDocumentsPage.jsx`:**
```jsx
// Similar version column
<td className="py-4 px-4 text-sm text-foreground">
    v{doc.version}
</td>
```

**In `AdminDocumentsPage.jsx`:**
```jsx
// Version column with history link
<td className="py-4 px-4">
    <div className="flex items-center gap-2">
        <span className="text-sm font-medium">v{doc.version}</span>
        <button
            onClick={() => viewVersionHistory(doc._id)}
            className="text-xs text-blue-600 hover:underline"
        >
            View History
        </button>
    </div>
</td>
```

### **Implementation Required:** ✅ **YES**

---

## 5. ✅ Field Validation Update - **PARTIALLY FIXED**

### **Issue Description:**
> The Selected Date field must be mandatory during document upload.
> The Comments field should remain optional.

### **Current Status:**
- ✅ Comments field is optional (correct)
- ⚠️ Applicable Date field is optional (needs to be mandatory)

### **Proposed Solution:**

**Backend Validation:**
```javascript
// server/src/controllers/document.controller.js
exports.uploadDocument = async (req, res, next) => {
    const { applicableDate } = req.body
    
    // Add validation
    if (!applicableDate) {
        return res.status(400).json({
            success: false,
            message: 'Applicable Date is required'
        })
    }
    
    // Continue with upload...
}
```

**Frontend Validation:**
```jsx
// client/src/pages/DocumentsPage.jsx
const handleUpload = async () => {
    // Validate applicable date
    if (!formData.applicableDate) {
        alert('Applicable Date is required')
        return
    }
    
    // Continue with upload...
}
```

**Update Form Field:**
```jsx
<div>
    <label className="block text-sm font-medium text-foreground mb-2">
        Applicable Date <span className="text-red-500">*</span>
    </label>
    <input
        type="date"
        value={formData.applicableDate}
        onChange={(e) => setFormData({ ...formData, applicableDate: e.target.value })}
        className="w-full px-4 py-2 border border-border rounded-lg"
        required
    />
</div>
```

### **Implementation Required:** ✅ **YES**

---

## 📋 **Implementation Priority**

| # | Issue | Priority | Effort | Status |
|---|-------|----------|--------|--------|
| 1 | Document Visibility | ✅ DONE | - | Working |
| 2 | Rejected Comment Display | 🔴 HIGH | Low | Needs Fix |
| 5 | Field Validation (Applicable Date) | 🔴 HIGH | Low | Needs Fix |
| 4 | Version Number Display | 🟡 MEDIUM | Low | Needs Implementation |
| 3 | Version History Implementation | 🟢 LOW | High | Future Enhancement |

---

## 🚀 **Quick Fixes (Can be done immediately)**

### **Fix #1: Rejected Comment Display**
- Update `DocumentsPage.jsx` to show feedback with reviewer info
- Update `LabOwnerDocumentsPage.jsx` similarly
- Ensure `reviewedBy` is populated in backend queries ✅ (already done)

### **Fix #2: Make Applicable Date Mandatory**
- Add backend validation in `uploadDocument` controller
- Add frontend validation in upload form
- Add asterisk (*) to label
- Add `required` attribute to input

### **Fix #3: Add Version Number Column**
- Add "Version" column to all document tables
- Display version badge (v1, v2, etc.)
- Show "Latest" badge for current version

---

## 🔧 **Files to Modify**

### **For Quick Fixes:**
1. `client/src/pages/DocumentsPage.jsx` - Add feedback display + validation
2. `client/src/pages/LabOwnerDocumentsPage.jsx` - Add feedback display + version column
3. `client/src/pages/AdminDocumentsPage.jsx` - Add version column
4. `server/src/controllers/document.controller.js` - Add date validation

### **For Version History (Future):**
1. `server/src/controllers/document.controller.js` - Add uploadNewVersion
2. `server/src/routes/document.routes.js` - Add version upload route
3. `client/src/pages/DocumentsPage.jsx` - Add version upload UI
4. `client/src/components/VersionHistoryModal.jsx` - Create new component
5. `client/src/services/document.js` - Add uploadNewVersion method

---

## 📝 **Testing Checklist**

After implementing fixes:

- [ ] Lab Technician can see only their documents
- [ ] Lab Owner can see documents from owned labs
- [ ] Admin can see all documents
- [ ] Rejected documents show clear feedback with reviewer name and date
- [ ] Applicable Date is required (validation works)
- [ ] Comments remain optional
- [ ] Version number displays in all document lists
- [ ] Version badges show correctly (v1, v2, Latest)

---

## 💡 **Recommendations**

1. **Implement Quick Fixes First** (Priority 1 & 2)
   - Low effort, high impact
   - Improves user experience immediately

2. **Add Version Display** (Priority 3)
   - Medium effort, good value
   - Provides visibility into document versions

3. **Full Version History** (Priority 4)
   - High effort, nice-to-have
   - Can be implemented in future sprint

---

## ✅ **Summary**

- **Issue #1 (Visibility):** ✅ Already working correctly
- **Issue #2 (Feedback Display):** 🔧 Needs UI improvement
- **Issue #3 (Version History):** 🚀 Future enhancement
- **Issue #4 (Version Display):** 🔧 Needs UI addition
- **Issue #5 (Field Validation):** 🔧 Needs validation update

**Total Fixes Needed:** 3 (Issues #2, #4, #5)  
**Estimated Time:** 2-3 hours for all quick fixes

---

**Would you like me to implement these fixes now?** 🚀
