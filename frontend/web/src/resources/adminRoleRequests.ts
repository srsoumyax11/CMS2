import { defineResource } from '@/components/data/types';
import { apiClient } from '@/lib/apiClient';

export interface AdminRoleRequest {
  id: string;
  userName: string;
  roleCode: string;
  claimedCode: string;
  departmentName?: string;
  status: string;
  createdAt: string;
}

export const adminRoleRequestsResource = defineResource<AdminRoleRequest>({
  id: 'admin_role_requests',
  titleKey: 'Pending Role Approvals Queue',
  subtitleKey: 'Review and grant user role onboarding applications across campus',
  idField: 'id',
  endpoint: {
    list: '/api/v1/approvals/role-requests',
  },
  columns: ['userName', 'roleCode', 'claimedCode', 'departmentName', 'status', 'createdAt'],
  fields: [
    {
      key: 'userName',
      labelKey: 'User Name',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      key: 'roleCode',
      labelKey: 'Target Role',
      type: 'text',
      sortable: true,
    },
    {
      key: 'claimedCode',
      labelKey: 'Claimed Code',
      type: 'text',
    },
    {
      key: 'departmentName',
      labelKey: 'Department',
      type: 'text',
    },
    {
      key: 'status',
      labelKey: 'Status',
      type: 'status',
      sortable: true,
    },
    {
      key: 'createdAt',
      labelKey: 'Applied Date',
      type: 'datetime',
      sortable: true,
    },
  ],
  detailTabs: ['details', 'timeline', 'audit'],
  rowActions: [
    {
      key: 'approve',
      labelKey: 'Approve Role',
      confirm: 'none',
      visibleWhen: (row) => row.status === 'PENDING',
      handler: async (row) => {
        await apiClient(`/api/v1/approvals/role-requests/${row.id}/approve`, { method: 'POST' });
      },
    },
    {
      key: 'reject',
      labelKey: 'Reject Role',
      confirm: 'reason',
      danger: true,
      visibleWhen: (row) => row.status === 'PENDING',
      handler: async (row, reason) => {
        await apiClient(`/api/v1/approvals/role-requests/${row.id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        });
      },
    },
  ],
  bulkActions: [
    {
      key: 'bulk_approve',
      labelKey: 'Approve Selected Roles',
      confirm: 'confirm',
      bulkHandler: async (rows) => {
        const ids = rows.map((r) => r.id);
        await apiClient('/api/v1/approvals/role-requests/bulk-approve', {
          method: 'POST',
          body: JSON.stringify({ ids }),
        });
        return Object.fromEntries(ids.map((id) => [id, true]));
      },
    },
  ],
  mockFallback: () => ({
    data: [
      {
        id: 'rr_adm_101',
        userName: 'Dr. Priya Sharma',
        roleCode: 'FACULTY',
        claimedCode: 'FAC-2026-CS-88',
        departmentName: 'Computer Science & Engineering',
        status: 'PENDING',
        createdAt: '2026-10-04 09:00',
      },
    ],
    total: 1,
  }),
});
