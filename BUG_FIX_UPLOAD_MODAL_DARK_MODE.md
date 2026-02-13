---
name: Bug Fix - Upload Modal Dark Mode
description: Fixed visibility issues in Upload Document modal for dark mode and ensured responsiveness.
files:
  - client/src/pages/DocumentsPage.jsx
message: >
  Added `bg-background text-foreground` and `placeholder:text-muted-foreground` to all inputs, selects, and textareas in the Upload Document and Version Upload modals. This ensures that text and placeholders are visible in dark mode, where the background was previously defaulting to white with light text. Responsiveness was verified by ensuring the modal fits within the viewport and the document table is scrollable.
---

# Details

### Changes
1.  **DocumentsPage.jsx**:
    -   Updated inputs, selects, and textareas to include `bg-background` and `text-foreground`.
    -   Added `placeholder:text-muted-foreground` to inputs and textareas.
    -   These changes apply to both the "Upload Document" modal and the "Upload New Version" modal.

### Verification
-   Verified that inputs now have explicit background and text colors, preventing visibility issues in dark mode.
-   Verified responsive layout for modal (max-width, scrollable) and table (horizontal scroll).
