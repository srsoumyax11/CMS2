import React from 'react';
import { Button } from './Button';

export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = () => <Button label="Primary Button" onPress={() => {}} />;
export const Secondary = () => <Button label="Secondary Button" onPress={() => {}} variant="secondary" />;
export const Danger = () => <Button label="Danger Button" onPress={() => {}} variant="danger" />;
export const Loading = () => <Button label="Loading" onPress={() => {}} isLoading={true} />;
