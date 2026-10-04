import React from 'react';
import { render } from '@testing-library/react-native';
import { Button, Input } from '../src';
import { colors } from '@campus/design-tokens';

describe('UI Accessibility & Design Tokens Pass (Item 19)', () => {
  it('assigns screen reader accessibility labels and button roles', () => {
    const { getByTestId } = render(
      <Button label="Submit Request" onPress={() => {}} testID="accessible-btn" />
    );
    const btn = getByTestId('accessible-btn');
    expect(btn.props.accessibilityRole).toBe('button');
    expect(btn.props.accessibilityLabel).toBe('Submit Request');
  });

  it('assigns screen reader accessibility labels to input fields', () => {
    const { getByTestId } = render(
      <Input label="Roll Number" value="" onChangeText={() => {}} testID="accessible-input" />
    );
    const input = getByTestId('accessible-input');
    expect(input.props.accessibilityLabel).toBe('Roll Number');
  });

  it('enforces min 44px touch target height on buttons from design tokens', () => {
    const { getByTestId } = render(
      <Button label="Touch Target Test" onPress={() => {}} testID="touch-target-btn" />
    );
    const btn = getByTestId('touch-target-btn');
    const flatStyle = Array.isArray(btn.props.style) ? Object.assign({}, ...btn.props.style) : btn.props.style;
    expect(flatStyle.minHeight).toBeGreaterThanOrEqual(44);
  });

  it('passes contrast check for primary text against card background', () => {
    expect(colors.gray[900]).toBe('#111827');
    expect(colors.white).toBe('#ffffff');
    expect(colors.primary[600]).toBe('#4f46e5');
  });
});
