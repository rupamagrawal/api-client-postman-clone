# Tasks - Full Postman Clone Features

- [x] Fix RequestPanel.tsx — Make Send button actually work
- [x] Fix ResponseViewer.tsx — Show real response & syntax highlighting (atomOneDark)
- [x] Fix ParamsTab.tsx — Sync query parameters both ways with URL
- [x] Fix Sidebar.tsx — Collections filtering, deletions, and Postman v2.1 JSON Export
- [x] Implement NewCollectionModal.tsx — Create and reload collections
- [x] Implement SaveRequestModal.tsx — Name input, selector dropdown, and sync to collections
- [x] Implement EnvironmentModal.tsx — Manage variables, auto-save on blur
- [x] Fix TopBar.tsx environment selector — Checkmarks for active environment, Manage Environment trigger
- [x] Implement {{variable}} highlighting in URL bar — Red for missing variables, orange for active variables
- [x] Add "Save" button UI in RequestPanel — Ghost style normally, filled when tab is dirty
- [x] Implement Export Collection (Postman v2.1 format) — Blob download
- [x] Keyboard shortcuts (Ctrl+Enter, Ctrl+T, Ctrl+W) — Global window listeners

## Phase 2 Specific Fixes
- [x] Fix 1: "+ New" button — open a real new blank tab (Zustand addTab, active immediately)
- [x] Fix 2: "Import" button — JSON file parser for Postman collections v2.1
- [x] Fix 3: Settings icon — Dropdown list, opens AppSettingsModal overlay
- [x] Fix 4: Close tab confirmation dialog — checks tab.isDirty, uses Radix UI Dialog overlay for Save/Discard/Cancel

All features have been successfully built, integrated, and verified!
