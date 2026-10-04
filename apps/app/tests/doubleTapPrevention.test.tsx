import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button, SosButton } from '@campus/ui';

describe('Double-Tap Prevention (Item 17)', () => {
  it('prevents double submission on Button when isLoading or disabled', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <Button
        label="Submit Payment"
        onPress={mockOnPress}
        isLoading={true}
        disabled={true}
        testID="btn-payment"
      />
    );

    const button = getByTestId('btn-payment');
    fireEvent.press(button);
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('prevents double trigger on SosButton while active or disabled', () => {
    const mockOnTrigger = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <SosButton
        onDispatchSos={mockOnTrigger}
        isLoading={true}
      />
    );

    const sosButton = getByTestId('btn-trigger-sos');
    fireEvent.press(sosButton);

    expect(mockOnTrigger).not.toHaveBeenCalled();
  });
});
