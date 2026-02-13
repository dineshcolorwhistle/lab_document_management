---
name: Bug Fix - Date Input User Experience
description: Improved the user experience for the "Applicable Date" input field.
files:
  - client/src/index.css
  - client/src/pages/DocumentsPage.jsx
message: >
  Fixed the visibility of the calendar icon in dark mode by inverting the color filter. Enhanced the date input behavior to open the calendar picker when clicking anywhere within the input field, not just on the calendar icon.
---

# Details

### Changes
1.  **index.css**:
    -   Added a CSS rule for `.dark input[type="date"]::-webkit-calendar-picker-indicator` to apply `filter: invert(1)` in dark mode. This ensures the calendar icon is white (visible) against the dark background.
    -   Added `cursor: pointer` to the calendar picker indicator.

2.  **DocumentsPage.jsx**:
    -   Added `onClick={(e) => e.target.showPicker()}` handler to the "Applicable Date" inputs in both the "Upload Document" and "Upload New Version" modals. This programmatically opens the browser's date picker when the user clicks anywhere in the input field.
    -   Added `cursor-pointer` utility class to the date inputs to indicate they are interactive.

### Verification
-   Verified that the calendar icon is now visible in dark mode.
-   Verified that clicking anywhere effectively opens the calendar picker.
