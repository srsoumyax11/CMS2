import { defineResource } from '@/components/data/types';
import { onboardingApi, RoleApplication } from '@/features/onboarding/api';

export const myApplicationsResource = defineResource<RoleApplication>({
  id: 'my_applications',
  titleKey: 'applications.myApplications',
  subtitleKey: 'Track your submitted role requests and onboarding verification status',
  idField: 'id',
  endpoint: {
    list: '/api/v1/role-requests',
  },
  columns: ['role', 'status', 'appliedAt'],
  fields: [
    {
      key: 'role',
      labelKey: 'Requested Role',
      type: 'text',
      sortable: true,
    },
    {
      key: 'status',
      labelKey: 'Status',
      type: 'status',
      sortable: true,
    },
    {
      key: 'appliedAt',
      labelKey: 'Submitted Date',
      type: 'datetime',
      sortable: true,
    },
    {
      key: 'rejectionReason',
      labelKey: 'Rejection Reason',
      type: 'text',
    },
  ],
  detailTabs: ['details', 'timeline'],
  rowActions: [
    {
      key: 'cancel',
      labelKey: 'Cancel Request',
      confirm: 'confirm',
      danger: true,
      visibleWhen: (row) => row.status === 'PENDING',
      handler: async (row) => {
        await onboardingApi.cancelApplication(row.id);
      },
    },
  ],
  mockFallback: () => ({
    data: [
      {
        id: 'req_app_01',
        role: 'STUDENT',
        status: 'PENDING',
        appliedAt: '2026-10-04 10:30',
      },
    ],
    total: 1,
  }),
});
