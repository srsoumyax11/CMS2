import React from 'react';
import { render } from '@testing-library/react-native';
import { StatusTimeline, TimelineStep } from '../src/StatusTimeline';

describe('StatusTimeline Component', () => {
  const steps: TimelineStep[] = [
    { id: '1', title: 'Step 1 Submitted', description: 'Request created', status: 'completed', timestamp: '10:00 AM' },
    { id: '2', title: 'Step 2 Under Review', description: 'Pending warden approval', status: 'active' },
    { id: '3', title: 'Step 3 Final Gate', status: 'pending' },
  ];

  it('renders all step titles and descriptions correctly', () => {
    const { getByText } = render(<StatusTimeline steps={steps} />);

    expect(getByText('Step 1 Submitted')).toBeTruthy();
    expect(getByText('Request created')).toBeTruthy();
    expect(getByText('10:00 AM')).toBeTruthy();
    expect(getByText('Step 2 Under Review')).toBeTruthy();
    expect(getByText('Step 3 Final Gate')).toBeTruthy();
  });
});
