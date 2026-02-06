# Machine Instance Access Control Fix

## Issue
Lab Owners and Lab Technicians were able to see all machine instances instead of only those from their assigned labs.

## Solution Implemented

### Backend Changes

**File**: `server/src/controllers/machineInstance.controller.js`

#### 1. Enhanced `listMachineInstances` Function
Added filtering for LAB_TECHNICIAN role (lines 51-76):
- Queries labs where the user is in the `labTechnicians` array
- Filters machine instances to only show those in assigned labs
- Validates lab filter parameter to ensure technician can only filter by their assigned labs
- Returns empty array if technician has no assigned labs
- **Note**: Uses `Lab.labTechnicians` for consistency with `getMyLabs` endpoint

#### 2. Enhanced `getMachineInstance` Function
Added access control for LAB_TECHNICIAN role (lines 135-141):
- Verifies the technician is assigned to the lab via `Lab.labTechnicians`
- Returns 403 Forbidden error if access is denied

### Existing Functionality (Already Working)
- **LAB_OWNER**: Already had proper filtering (lines 31-49)
  - Can only see machine instances from labs they own
  - Validated through Lab.labOwners field
  
- **ADMIN/SUPER_ADMIN**: Can see all machine instances
  - Optional filtering by labId parameter

### Access Control Summary

| Role | List Access | View Details | Create | Update | Delete |
|------|-------------|--------------|--------|--------|--------|
| SUPER_ADMIN | All instances | All instances | ✅ | ✅ | ✅ |
| ADMIN | All instances | All instances | ✅ | ✅ | ✅ |
| LAB_OWNER | Owned labs only | Owned labs only | ✅ | ✅ | ✅ |
| LAB_TECHNICIAN | Assigned labs only | Assigned labs only | ❌ | ❌ | ❌ |

### Frontend
**File**: `client/src/pages/MachineInstancesPage.jsx`

No changes needed! The frontend already:
- Uses `selectedLab` from LabContext
- Passes `labId` parameter to the API
- Handles permissions correctly with `canEdit` flag
- Shows view-only mode for LAB_TECHNICIAN

### Testing Checklist

1. **Lab Technician**:
   - [ ] Can only see machine instances from assigned labs
   - [ ] Cannot see instances from unassigned labs
   - [ ] Can view details of assigned machines
   - [ ] Cannot view details of unassigned machines
   - [ ] Cannot create/edit/delete any machines
   - [ ] Lab filter dropdown only shows assigned labs

2. **Lab Owner**:
   - [ ] Can only see machine instances from owned labs
   - [ ] Cannot see instances from non-owned labs
   - [ ] Can create/edit/delete machines in owned labs
   - [ ] Lab filter dropdown only shows owned labs

3. **Admin/Super Admin**:
   - [ ] Can see all machine instances
   - [ ] Can filter by any lab
   - [ ] Can create/edit/delete any machine

### Database Schema Reference

**Lab Model** (fields used for access control):
```javascript
labOwners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
labTechnicians: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
```

**Note**: The system uses `Lab.labOwners` and `Lab.labTechnicians` arrays to determine access. The `User.assignedLabs` field exists but is NOT used for machine instance access control to ensure consistency with the `getMyLabs` endpoint.

### API Endpoints

All endpoints at `/api/machine-instances`:

- `GET /` - List machine instances (filtered by role)
- `GET /:id` - Get single instance (access controlled)
- `POST /` - Create instance (ADMIN, SUPER_ADMIN, LAB_OWNER only)
- `PATCH /:id` - Update instance (ADMIN, SUPER_ADMIN, LAB_OWNER only)
- `DELETE /:id` - Delete instance (ADMIN, SUPER_ADMIN, LAB_OWNER only)

## Notes

- The fix maintains backward compatibility
- No database migrations required
- Frontend automatically benefits from backend filtering
- Error messages are user-friendly (403 Forbidden for unauthorized access)
- Empty arrays returned for users with no assigned/owned labs
