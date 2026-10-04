import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ApprovalInbox, ApprovalItem } from '@campus/ui';

const mockItems: ApprovalItem[] = [
  {
    id: 'req_1',
    title: 'Outpass Application',
    applicantName: 'John Doe',
    details: 'Weekend pass for home visit',
    submittedAt: '2026-10-04 10:00',
  },
  {
    id: 'req_2',
    title: 'Bonafide Certificate',
    applicantName: 'Jane Smith',
    details: 'Certificate for passport application',
    submittedAt: '2026-10-04 10:30',
  },
];

describe('ApprovalInbox Component (Gap 3)', () => {
  it('requires rejection reason and disables confirm button when empty', async () => {
    const mockReject = jest.fn().mockResolvedValue(undefined);
    const mockApprove = jest.fn().mockResolvedValue(undefined);

    const { getByTestId, getByText } = render(
      <ApprovalInbox items={mockItems} onApprove={mockApprove} onReject={mockReject} />
    );

    // Click reject on first item
    fireEvent.press(getByTestId('btn-reject-req_1'));

    // Confirm button should be disabled initially when reason is empty
    const confirmRejectBtn = getByTestId('btn-confirm-reject');
    expect(confirmRejectBtn.props.accessibilityState?.disabled).toBe(true);

    // Type reason
    fireEvent.changeText(getByTestId('input-reject-reason'), 'Insufficient justification provided.');

    // Confirm reject
    fireEvent.press(confirmRejectBtn);

    await waitFor(() => {
      expect(mockReject).toHaveBeenCalledWith('req_1', 'Insufficient justification provided.');
    });
  });

  it('prompts confirmation modal before approving and blocks double taps', async () => {
    const mockApprove = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    const mockReject = jest.fn().mockResolvedValue(undefined);

    const { getByTestId, getByText } = render(
      <ApprovalInbox items={mockItems} onApprove={mockApprove} onReject={mockReject} />
    );

    // Press approve on item 1
    fireEvent.press(getByTestId('btn-approve-req_1'));

    // Confirmation modal should appear
    expect(getByText(/Are you sure you want to approve "Outpass Application"/i)).toBeTruthy();

    const confirmApproveBtn = getByTestId('btn-confirm-approve');
    fireEvent.press(confirmApproveBtn);
    fireEvent.press(confirmApproveBtn); // Second tap during async process

    await waitFor(() => {
      expect(mockApprove).toHaveBeenCalledTimes(1);
      expect(mockApprove).toHaveBeenCalledWith(['req_1']);
    });
  });

  it('handles bulk approve with per-item partial results summary', async () => {
    const mockApprove = jest.fn().mockResolvedValue([
      { itemId: 'req_1', success: true },
      { itemId: 'req_2', success: false, error: 'Quota exceeded' },
    ]);
    const mockReject = jest.fn().mockResolvedValue(undefined);

    const { getByTestId, getByText } = render(
      <ApprovalInbox items={mockItems} onApprove={mockApprove} onReject={mockReject} />
    );

    // Select both checkboxes
    fireEvent.press(getByTestId('checkbox-select-req_1'));
    fireEvent.press(getByTestId('checkbox-select-req_2'));

    // Click bulk approve
    fireEvent.press(getByTestId('btn-bulk-approve'));

    // Confirm bulk approval in modal
    fireEvent.press(getByTestId('btn-confirm-approve'));

    await waitFor(() => {
      expect(mockApprove).toHaveBeenCalledWith(['req_1', 'req_2']);
      expect(getByTestId('bulk-approve-results')).toBeTruthy();
      expect(getByText(/✓ Approved/i)).toBeTruthy();
      expect(getByText(/✗ Failed: Quota exceeded/i)).toBeTruthy();
    });
  });
});
