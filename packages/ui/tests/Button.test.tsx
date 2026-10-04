import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../src/Button';

describe('Button Primitive Component', () => {
  it('renders label correctly and handles press events', () => {
    const onPressMock = jest.fn();
    const { getByText, getByRole } = render(
      <Button label="Submit Action" onPress={onPressMock} />
    );

    expect(getByText('Submit Action')).toBeTruthy();
    const button = getByRole('button');
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders loading state indicator when isLoading is true', () => {
    const { getByRole, queryByText } = render(
      <Button label="Loading Button" onPress={() => {}} isLoading={true} />
    );

    const button = getByRole('button');
    expect(button.props.accessibilityState.busy).toBe(true);
    expect(queryByText('Loading Button')).toBeNull();
  });
});
