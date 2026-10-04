import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Sheet } from '../src/Sheet';

describe('Sheet Component', () => {
  it('renders title, accessibility labels, and close button when visible', () => {
    const onCloseMock = jest.fn();
    const { getByText, getByLabelText } = render(
      <Sheet visible={true} onClose={onCloseMock} title="Filter Options">
        <Text>Sheet Body Content</Text>
      </Sheet>
    );

    expect(getByText('Filter Options')).toBeTruthy();
    expect(getByText('Sheet Body Content')).toBeTruthy();

    const closeBtn = getByLabelText('Close modal');
    expect(closeBtn).toBeTruthy();
    fireEvent.press(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
