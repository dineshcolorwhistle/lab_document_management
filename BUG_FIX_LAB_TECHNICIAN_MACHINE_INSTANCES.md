# Machine Instance List Bug Fix - Lab Technician Role

## Date: 2026-02-06

## Problem Description

Lab Technicians were experiencing two related issues:

1.  **Machine Instance List**: The machine instance list page showed "No machine instances found" even when they had labs assigned to them
2.  **Document Upload**: The "Upload Document" modal's machine instance dropdown was empty, preventing them from uploading documents

Both issues occurred while Lab Owners could see their machine instances and upload documents correctly.

## Root Cause

The bug was caused by **data model inconsistency** in how lab-technician assignments were being queried:

1. **Lab Model** has a `labTechnicians` field (array of user IDs)
2. **User Model** has an `assignedLabs` field (array of lab IDs)

The system had two different approaches for checking lab technician access:

- **`getMyLabs` endpoint** (working correctly): Queried `Lab.find({ labTechnicians: userId })`
- **`listMachineInstances` endpoint** (broken): Queried `User.assignedLabs`
- **`getMachineInstancesForTechnician` endpoint** (broken): Queried `User.assignedLabs`

When labs are created or updated via the admin interface, the system updates `Lab.labTechnicians` but does NOT automatically sync `User.assignedLabs`. This caused a mismatch where:
- Lab Technicians could see their assigned labs in dropdowns (via `getMyLabs`)
- But could NOT see machine instances in those labs (because `User.assignedLabs` was empty)

## Solution

Changed the `listMachineInstances` and `getMachineInstance` functions in `machineInstance.controller.js` to use the same approach as `getMyLabs`:

### Before (Broken):
```javascript
// Used User.assignedLabs which was not being populated
const user = await User.findById(userId).select('assignedLabs')
const labIds = user.assignedLabs
```

### After (Fixed):
```javascript
// Query labs where user is in labTechnicians array
const userLabs = await Lab.find({ labTechnicians: userId }).select('_id')
const labIds = userLabs.map((l) => l._id)
```

## Files Modified

1. **`server/src/controllers/machineInstance.controller.js`**
   - Updated `listMachineInstances` function (lines 51-76)
   - Updated `getMachineInstance` function (lines 135-141)
   - Removed unused `User` model import

2. **`server/src/controllers/document.controller.js`**
   - Updated `getMachineInstancesForTechnician` function (lines 12-42)
   - Updated `uploadDocument` function (lines 109-117)
   - Changed from `User` to `Lab` model import
   - **Impact**: This fixes the "Upload Document" modal not showing machine instances

3. **`MACHINE_INSTANCE_ACCESS_FIX.md`**
   - Updated documentation to reflect the actual implementation

## Testing Recommendations

1. **Lab Technician - Machine Instance List**:
   - ✅ Can see machine instances from assigned labs
   - ✅ Cannot see instances from unassigned labs
   - ✅ Can view details of assigned machines
   - ✅ Cannot view details of unassigned machines
   - ✅ Lab filter dropdown shows assigned labs

2. **Lab Technician - Document Upload**:
   - ✅ Upload Document modal shows machine instances from assigned labs
   - ✅ Cannot upload documents to unassigned machine instances
   - ✅ Can successfully upload documents to assigned machine instances

3. **Lab Owner**:
   - ✅ Can see machine instances from owned labs (unchanged)
   - ✅ Can create/edit/delete machines in owned labs (unchanged)

4. **Admin/Super Admin**:
   - ✅ Can see all machine instances (unchanged)

## Technical Notes

- The fix ensures consistency by using `Lab.labTechnicians` as the single source of truth
- No database migration required
- No changes needed to the frontend
- The `User.assignedLabs` field still exists but is not used for machine instance access control
- This approach matches the existing `getMyLabs` endpoint implementation

## Impact

- **Low Risk**: The change aligns the code with the existing pattern used in `getMyLabs`
- **No Breaking Changes**: Lab Owners and Admins are unaffected
- **Immediate Fix**: Lab Technicians will now see their machine instances correctly
