import { ComponentProps, createElement } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { IconComponent } from '../types/icon';

type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function materialCommunityIcon(name: MaterialCommunityIconName): IconComponent {
  return ({ color, size }) => createElement(MaterialCommunityIcons, {
    color: color ?? '#000000',
    name,
    size: size ?? 24,
  });
}
