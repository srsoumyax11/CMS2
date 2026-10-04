import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../src/Input';

describe('Input Primitive Component', () => {
  it('renders label and handles text change', () => {
    const onChangeTextMock = jest.fn();
    const { getByLabelText } = render(
      <Input label="Email Address" onChangeText={onChangeTextMock} />
    );

    const input = getByLabelText('Email Address');
    fireEvent.changeText(input, 'test@campus.edu');
    expect(onChangeTextMock).toHaveBeenCalledWith('test@campus.edu');
  });

  it('renders error message when error prop is provided', () => {
    const { getByText } = render(
      <Input label="Phone" error="Phone number is required" />
    );

    expect(getByText('Phone number is required')).toBeTruthy();
  });
});
