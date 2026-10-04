# Data Kit Quick Start Guide

The Data Kit allows you to create fully-featured, production-ready admin and management pages (including server pagination, sorting, search, column preferences, drawer viewer, edit form, and bulk workflow actions) in **under 10 lines of code**.

---

## How to Add a New Resource (in 10 lines)

### 1. Define the Resource Configuration (`src/resources/myEntity.ts`)

```typescript
import { defineResource } from '@/components/data/types';

export const myEntityResource = defineResource({
  id: 'my_entity',
  titleKey: 'My Entities',
  idField: 'id',
  endpoint: { list: '/api/v1/my-entities' },
  columns: ['title', 'status', 'createdAt'],
  fields: [
    { key: 'title', labelKey: 'Title', type: 'text', sortable: true },
    { key: 'status', labelKey: 'Status', type: 'status', filterable: true },
    { key: 'createdAt', labelKey: 'Created Date', type: 'datetime', sortable: true },
  ],
});
```

### 2. Render the Page Component (`src/pages/MyEntityPage.tsx`)

```tsx
import React from 'react';
import { ResourcePage } from '@/components/resource-page/ResourcePage';
import { myEntityResource } from '@/resources/myEntity';

export const MyEntityPage: React.FC = () => (
  <ResourcePage resource={myEntityResource} />
);
```

---

## Core Capabilities Out of the Box

1. **Server Pagination & Sorting**: Automatically syncs limit, offset, sort key, order, and filters with the URL (`useUrlState`).
2. **Column Preferences**: Saves user column selection and density (`compact`, `comfortable`, `expanded`) in `localStorage` per resource ID (`useTablePrefs`).
3. **RecordViewer Drawer**: Opens desktop drawer / mobile full-screen modal with tabs (Details, Timeline, Comments, Attachments, Audit) and next/prev record navigation.
4. **Form & Validation**: Edit mode auto-generates forms with Zod validation (`FormRenderer`) and protects against unsaved changes & 409 conflict states.
5. **Action Controls**: Configure single row actions and bulk actions with permission gating (`PermissionGate`), confirmation modals (`ConfirmDialog`), and required rejection reasons (`ReasonDialog`).
6. **CSV Exporting**: One-click CSV export respecting visible columns while guaranteeing fields marked `sensitive: true` are never included.
