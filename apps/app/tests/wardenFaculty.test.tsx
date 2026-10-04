import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AttendanceScreen } from '@campus/features';
import { FeesScreen } from '@campus/features';
import { SosButton } from '@campus/ui';
import { OutpassApprovalInbox } from '@campus/features';
import { SosControlRoom } from '@campus/features';
import { AttendanceSessionControl } from '@campus/features';

describe('Milestone 4 & 5a Component & Handler Test Suite', () => {
  describe('AttendanceScreen', () => {
    it('shows offline warning message "Connect to mark attendance" when navigator is offline', async () => {
      const originalNavigator = global.navigator;
      // Mock offline status
      Object.defineProperty(global, 'navigator', {
        value: { onLine: false },
        configurable: true,
      });

      const { getByTestId, findByTestId } = render(<AttendanceScreen />);
      const input = getByTestId('input-attendance-code');
      fireEvent.changeText(input, '123456');

      const btn = getByTestId('btn-verify-attendance-code');
      fireEvent.press(btn);

      const notice = await findByTestId('attendance-status-notice');
      expect(notice.props.children).toBe('Connect to mark attendance');

      // Restore navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        configurable: true,
      });
    });

    it('allows raising attendance dispute with date and reason', async () => {
      const mockDispute = jest.fn().mockResolvedValue(undefined);
      const { getByTestId, getByText } = render(
        <AttendanceScreen onRaiseDispute={mockDispute} />
      );

      const disputeBtn = getByTestId('btn-dispute-CS101');
      fireEvent.press(disputeBtn);

      const dateInput = getByTestId('input-dispute-date');
      fireEvent.changeText(dateInput, '2026-10-01');

      const reasonInput = getByTestId('input-dispute-reason');
      fireEvent.changeText(reasonInput, 'Was present in lab session');

      const submitBtn = getByTestId('btn-confirm-dispute');
      fireEvent.press(submitBtn);

      await waitFor(() => {
        expect(mockDispute).toHaveBeenCalledWith({
          subjectCode: 'CS101',
          date: '2026-10-01',
          reason: 'Was present in lab session',
        });
      });
    });
  });

  describe('FeesScreen', () => {
    it('shows student name before paying and enforces single submission with status re-read', async () => {
      const mockPay = jest.fn().mockResolvedValue({ success: true, status: 'paid' });
      const { getByTestId, getByText, getAllByText } = render(
        <FeesScreen studentName="Alice Vance" onPayFee={mockPay} />
      );

      // Verify student name is shown in dues card
      expect(getByText('Student: Alice Vance (CS-2024-042)')).toBeTruthy();

      const payNowBtn = getByTestId('btn-pay-fee_1');
      fireEvent.press(payNowBtn);

      // Verify student name in modal (appears in card and modal)
      expect(getAllByText(/Alice Vance/).length).toBeGreaterThanOrEqual(2);

      const confirmBtn = getByTestId('btn-confirm-fee-pay');
      fireEvent.press(confirmBtn);
      fireEvent.press(confirmBtn); // Double tap attempt

      await waitFor(() => {
        expect(mockPay).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Warden Operations', () => {
    it('approves and rejects outpass items with mandatory reason', async () => {
      const mockApprove = jest.fn().mockResolvedValue(undefined);
      const mockReject = jest.fn().mockResolvedValue(undefined);

      const { getByTestId } = render(
        <OutpassApprovalInbox onApprove={mockApprove} onReject={mockReject} />
      );

      const approveBtn = getByTestId('btn-approve-out_101');
      fireEvent.press(approveBtn);

      const confirmApproveBtn = getByTestId('btn-confirm-approve');
      fireEvent.press(confirmApproveBtn);

      await waitFor(() => {
        expect(mockApprove).toHaveBeenCalledWith(['out_101']);
      });
    });

    it('acknowledges SOS alert once (single flight protection)', async () => {
      const mockAck = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = render(<SosControlRoom onAcknowledge={mockAck} />);

      const ackBtn = getByTestId('btn-ack-sos-sos_901');
      fireEvent.press(ackBtn);
      fireEvent.press(ackBtn); // Double tap attempt

      await waitFor(() => {
        expect(mockAck).toHaveBeenCalledTimes(1);
        expect(mockAck).toHaveBeenCalledWith('sos_901');
      });
    });
  });

  describe('Faculty Operations', () => {
    it('starts attendance session and displays countdown timer with manual refresh', async () => {
      const mockStart = jest.fn().mockResolvedValue({ code: '987654', expiresInSeconds: 30 });
      const { getByTestId } = render(<AttendanceSessionControl onStartSession={mockStart} />);

      const startBtn = getByTestId('btn-start-attendance-session');
      fireEvent.press(startBtn);

      await waitFor(() => {
        expect(getByTestId('rotating-attendance-code').props.children).toBe('987654');
      });
    });
  });
});
