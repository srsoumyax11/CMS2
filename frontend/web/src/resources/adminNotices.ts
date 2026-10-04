import { defineResource } from '@/components/data/types';
import { apiClient } from '@/lib/apiClient';

export interface AdminNoticeRecord {
  id: string;
  title: string;
  content: string;
  audience: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'RECALLED';
  createdAt: string;
}

export const adminNoticesResource = defineResource<AdminNoticeRecord>({
  id: 'admin_notices',
  titleKey: 'Campus Official Notices & Governance',
  subtitleKey: 'Manage, submit for review, approve, and recall official campus notices',
  idField: 'id',
  endpoint: {
    list: '/api/v1/admin/notices',
  },
  columns: ['title', 'audience', 'status', 'createdAt'],
  fields: [
    {
      key: 'title',
      labelKey: 'Notice Title',
      type: 'text',
      sortable: true,
      editable: true,
    },
    {
      key: 'content',
      labelKey: 'Notice Body / Announcement',
      type: 'textarea',
      editable: true,
    },
    {
      key: 'audience',
      labelKey: 'Target Audience',
      type: 'select',
      filterOptions: [
        { label: 'All Campus', value: 'ALL' },
        { label: 'Students Only', value: 'STUDENTS' },
        { label: 'Faculty Only', value: 'FACULTY' },
        { label: 'Hostel Wardens', value: 'WARDENS' },
      ],
      editable: true,
    },
    {
      key: 'status',
      labelKey: 'Approval Status',
      type: 'status',
      sortable: true,
      filterable: true,
    },
    {
      key: 'createdAt',
      labelKey: 'Created Date',
      type: 'datetime',
      sortable: true,
    },
  ],
  detailTabs: ['details', 'timeline', 'audit'],
  rowActions: [
    {
      key: 'submit',
      labelKey: 'Submit for Approval',
      confirm: 'confirm',
      visibleWhen: (row) => row.status === 'DRAFT',
      handler: async (row) => {
        await apiClient(`/api/v1/admin/notices/${row.id}/submit`, { method: 'POST' });
      },
    },
    {
      key: 'approve',
      labelKey: 'Approve & Publish',
      confirm: 'confirm',
      visibleWhen: (row) => row.status === 'SUBMITTED',
      handler: async (row) => {
        await apiClient(`/api/v1/admin/notices/${row.id}/approve`, { method: 'POST' });
      },
    },
    {
      key: 'recall',
      labelKey: 'Recall Notice',
      confirm: 'reason',
      danger: true,
      visibleWhen: (row) => row.status === 'APPROVED' || row.status === 'SUBMITTED',
      handler: async (row, reason) => {
        await apiClient(`/api/v1/admin/notices/${row.id}/recall`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        });
      },
    },
  ],
  mockFallback: () => ({
    data: [
      {
        id: 'not_101',
        title: 'Mid-Semester Break Announcement',
        content: 'Campus hostels will remain open during the upcoming mid-semester break.',
        audience: 'ALL',
        status: 'SUBMITTED',
        createdAt: '2026-10-04 14:00',
      },
      {
        id: 'not_102',
        title: 'Library Hours Extended for End-Terms',
        content: 'Central library will remain open 24/7 until completion of final exams.',
        audience: 'STUDENTS',
        status: 'APPROVED',
        createdAt: '2026-10-03 09:30',
      },
    ],
    total: 2,
  }),
});
