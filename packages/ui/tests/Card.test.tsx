import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { Card } from '../src/Card';

describe('Card Component', () => {
  it('renders children content inside card container', () => {
    const { getByText } = render(
      <Card>
        <Text>Card Children Content</Text>
      </Card>
    );

    expect(getByText('Card Children Content')).toBeTruthy();
  });
});
