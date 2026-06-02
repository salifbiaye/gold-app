import { ComponentProps, createElement } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IconComponent } from '../types/icon';

type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export function materialCommunityIcon(name: MaterialCommunityIconName): IconComponent {
  return ({ color, size }) => createElement(MaterialCommunityIcons, {
    color: color ?? '#000000',
    name,
    size: size ?? 24,
  });
}

/** Material Icons standard — équivaut exactement aux `Icons.*` de Flutter. */
export function materialIcon(name: MaterialIconName): IconComponent {
  return ({ color, size }) => createElement(MaterialIcons, {
    color: color ?? '#000000',
    name,
    size: size ?? 24,
  });
}
