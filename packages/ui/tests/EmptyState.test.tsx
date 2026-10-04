import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../src/EmptyState';

describe('EmptyState Component', () => {
  it('renders title and description correctly', () => {
    const { getByText } = render(
      <EmptyState title="No Outpasses" description="You have not requested any outpasses yet." />
    );

    expect(getByText('No Outpasses')).toBeTruthy();
    expect(getByText('You have not requested any outpasses yet.')).toBeTruthy();
  });

  it('renders retry button and triggers callback when onRetry is provided', () => {
    const onRetryMock = jest.fn();
    const { getByText } = render(
      <EmptyState title="Error Loading Data" onRetry={onRetryMock} retryLabel="Reload Page" />
    );

    const button = getByText('Reload Page');
    expect(button).toBeTruthy();
    fireEvent.press(button);
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });
});
