/* eslint-disable no-console */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlobalErrorBoundary } from '../src/components/ErrorBoundary';
import { AppError } from '@campus/api-client';

const ThrowError: React.FC<{ error: Error }> = ({ error }) => {
  throw error;
};

describe('GlobalErrorBoundary', () => {
  // Prevent React boundary console.error logs during expected error throw test
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <GlobalErrorBoundary>
        <Text>Normal Content</Text>
      </GlobalErrorBoundary>
    );

    expect(getByText('Normal Content')).toBeTruthy();
  });

  it('displays error message and request ID when AppError is thrown', () => {
    const appErr = new AppError({
      code: 'SERVER_ERROR',
      message: 'Failed to load user profile',
      status: 500,
      requestId: 'req-err-999',
    });

    const { getByText } = render(
      <GlobalErrorBoundary>
        <ThrowError error={appErr} />
      </GlobalErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Failed to load user profile')).toBeTruthy();
    expect(getByText('Request ID: req-err-999')).toBeTruthy();
  });

  it('allows user to click Try Again button to reset error state', () => {
    const err = new Error('Generic UI error');

    const { getByText } = render(
      <GlobalErrorBoundary>
        <ThrowError error={err} />
      </GlobalErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    const tryAgainBtn = getByText('Try Again');
    expect(tryAgainBtn).toBeTruthy();

    fireEvent.press(tryAgainBtn);
  });
});
