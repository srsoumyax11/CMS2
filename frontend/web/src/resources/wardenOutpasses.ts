import { defineResource } from '@/components/data/types';
import { outpassApi, OutpassRecord } from '@/features/outpass/api';

export const wardenOutpassResource = defineResource<OutpassRecord>({
  id: 'warden_outpass_inbox',
  titleKey: 'Warden Outpass Approvals Inbox',
  subtitleKey: 'Review, approve, and reject student hostel outpass requests',
  idField: 'id',
  endpoint: {
    list: '/api/v1/warden/outpasses',
  },
  columns: ['studentName', 'studentRoll', 'destination', 'reason', 'status', 'appliedAt'],
  fields: [
    {
      key: 'studentName',
      labelKey: 'Student Name',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      key: 'studentRoll',
      labelKey: 'Roll Number',
      type: 'text',
      sortable: true,
    },
    {
      key: 'destination',
      labelKey: 'Destination',
      type: 'text',
      sortable: true,
    },
    {
      key: 'reason',
      labelKey: 'Reason',
      type: 'textarea',
    },
    {
      key: 'leaveTime',
      labelKey: 'Departure Time',
      type: 'datetime',
    },
    {
      key: 'expectedReturnTime',
      labelKey: 'Expected Return',
      type: 'datetime',
    },
    {
      key: 'status',
      labelKey: 'Status',
      type: 'status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'PENDING', value: 'PENDING' },
        { label: 'APPROVED', value: 'APPROVED' },
        { label: 'REJECTED', value: 'REJECTED' },
      ],
    },
    {
      key: 'appliedAt',
      labelKey: 'Applied At',
      type: 'datetime',
      sortable: true,
    },
  ],
  detailTabs: ['details', 'timeline', 'comments'],
  rowActions: [
    {
      key: 'approve',
      labelKey: 'Approve',
      confirm: 'none',
      visibleWhen: (row) => row.status === 'PENDING',
      handler: async (row) => {
        await outpassApi.approveOutpass(row.id);
      },
    },
    {
      key: 'reject',
      labelKey: 'Reject',
      confirm: 'reason',
      danger: true,
      visibleWhen: (row) => row.status === 'PENDING',
      handler: async (row, reason) => {
        await outpassApi.rejectOutpass(row.id, reason || 'Rejected by Warden');
      },
    },
  ],
  bulkActions: [
    {
      key: 'bulk_approve',
      labelKey: 'Approve Selected',
      confirm: 'confirm',
      bulkHandler: async (rows) => {
        const results: Record<string, boolean> = {};
        for (const r of rows) {
          try {
            await outpassApi.approveOutpass(r.id);
            results[r.id] = true;
          } catch {
            results[r.id] = false;
          }
        }
        return results;
      },
    },
  ],
  mockFallback: () => ({
    data: [
      {
        id: 'out_w_101',
        destination: 'Railway Station',
        reason: 'Weekend Home Visit',
        leaveTime: '2026-10-05 16:00',
        expectedReturnTime: '2026-10-08 08:00',
        status: 'PENDING',
        appliedAt: '2026-10-04 18:30',
        studentName: 'Rahul Sharma',
        studentRoll: '21CS042',
      },
      {
        id: 'out_w_102',
        destination: 'City Hospital',
        reason: 'Dental Checkup',
        leaveTime: '2026-10-05 10:00',
        expectedReturnTime: '2026-10-05 14:00',
        status: 'PENDING',
        appliedAt: '2026-10-04 19:10',
        studentName: 'Sneha Patel',
        studentRoll: '21EC019',
      },
    ],
    total: 2,
  }),
});
