import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DataList } from '@campus/ui';
import { Text } from 'react-native';

describe('Error Handling & Shared DataList Verification (Item 16)', () => {
  it('renders loading indicator when isLoading is true', () => {
    const { getByTestId } = render(
      <DataList
        data={[]}
        isLoading={true}
        renderItem={({ item }) => <Text>{String(item)}</Text>}
      />
    );
    expect(getByTestId('datalist-loading')).toBeTruthy();
  });

  it('renders empty state when data is empty and not loading', () => {
    const { getByText } = render(
      <DataList
        data={[]}
        isLoading={false}
        emptyTitle="No Data Found"
        emptyDescription="Please check back later."
        renderItem={({ item }) => <Text>{String(item)}</Text>}
      />
    );
    expect(getByText('No Data Found')).toBeTruthy();
    expect(getByText('Please check back later.')).toBeTruthy();
  });

  it('renders error message with request ID and retry button on failure', () => {
    const mockOnRetry = jest.fn();
    const { getByText, getByTestId } = render(
      <DataList
        data={[]}
        isLoading={false}
        error="Network failure (Req ID: req-8849-xyz)"
        onRefresh={mockOnRetry}
        renderItem={({ item }) => <Text>{String(item)}</Text>}
      />
    );

    expect(getByText('Network failure (Req ID: req-8849-xyz)')).toBeTruthy();
    const retryBtn = getByTestId('btn-datalist-retry');
    expect(retryBtn).toBeTruthy();

    fireEvent.press(retryBtn);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
});
