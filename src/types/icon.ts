import { ComponentType } from 'react';

export type IconComponent = ComponentType<{
  color?: string;
  fill?: string;
  size?: number;
  strokeWidth?: number;
}>;
