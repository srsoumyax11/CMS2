import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SosButton } from '@campus/ui';

describe('SosButton Component (Gap 2)', () => {
  it('prevents double tap by sending only one SOS request with an idempotency key', async () => {
    const mockDispatch = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { getByTestId, getByText } = render(
      <SosButton onDispatchSos={mockDispatch} hasLocationPermission={true} />
    );

    // Open confirmation modal
    fireEvent.press(getByTestId('btn-trigger-sos'));

    // Press confirm twice rapidly
    const confirmBtn = getByTestId('btn-confirm-sos-dispatch');
    fireEvent.press(confirmBtn);
    fireEvent.press(confirmBtn);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    const payload = mockDispatch.mock.calls[0][0];
    expect(payload.idempotencyKey).toBeDefined();
    expect(payload.latitude).toBe(20.2961);
    expect(payload.longitude).toBe(85.8245);
    expect(payload.locationDenied).toBe(false);
  });

  it('sends SOS without coordinates when location permission is denied', async () => {
    const mockDispatch = jest.fn().mockResolvedValue(undefined);

    const { getByTestId, getByText } = render(
      <SosButton onDispatchSos={mockDispatch} hasLocationPermission={false} />
    );

    // Open confirm modal
    fireEvent.press(getByTestId('btn-trigger-sos'));

    expect(
      getByText(/Location permission denied. Are you sure you want to send an emergency SOS WITHOUT coordinates/i)
    ).toBeTruthy();

    fireEvent.press(getByTestId('btn-confirm-sos-dispatch'));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    const payload = mockDispatch.mock.calls[0][0];
    expect(payload.latitude).toBeNull();
    expect(payload.longitude).toBeNull();
    expect(payload.locationDenied).toBe(true);
  });
});
