import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { DataList } from '../src/DataList';

describe('DataList Component', () => {
  interface Item {
    id: string;
    name: string;
  }

  const items: Item[] = [
    { id: '1', name: 'Item One' },
    { id: '2', name: 'Item Two' },
  ];

  it('renders list items when data is provided', () => {
    const { getByText } = render(
      <DataList<Item>
        data={items}
        renderItem={({ item }) => <Text>{item.name}</Text>}
        keyExtractor={(item) => item.id}
      />
    );

    expect(getByText('Item One')).toBeTruthy();
    expect(getByText('Item Two')).toBeTruthy();
  });

  it('renders loading indicator when isLoading is true', () => {
    const { queryByText } = render(
      <DataList<Item>
        data={[]}
        isLoading={true}
        renderItem={({ item }) => <Text>{item.name}</Text>}
      />
    );

    expect(queryByText('Item One')).toBeNull();
  });

  it('renders error empty state when error is provided', () => {
    const { getByText } = render(
      <DataList<Item>
        data={[]}
        error="Network Failure"
        renderItem={({ item }) => <Text>{item.name}</Text>}
      />
    );

    expect(getByText('Failed to load data')).toBeTruthy();
    expect(getByText('Network Failure')).toBeTruthy();
  });

  it('renders default empty state when data array is empty', () => {
    const { getByText } = render(
      <DataList<Item>
        data={[]}
        emptyTitle="No Items Present"
        renderItem={({ item }) => <Text>{item.name}</Text>}
      />
    );

    expect(getByText('No Items Present')).toBeTruthy();
  });
});
