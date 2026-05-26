import { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'none';

type PressScaleProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: HapticType;
  disabled?: boolean;
};

export function PressScale({
  children,
  onPress,
  style,
  scaleTo = 0.93,
  haptic = 'light',
  disabled = false,
}: PressScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 40, bounciness: 3 }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 5 }).start();
  };

  const handlePress = () => {
    if (disabled || !onPress) return;
    if (haptic === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (haptic === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (haptic === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else if (haptic === 'selection') Haptics.selectionAsync();
    else if (haptic === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPress();
  };

  // Si un style est fourni (bouton avec dimensions), l'Animated.View prend 100% du Pressable
  // pour que les % (ex: width:'22%') soient calculés par rapport au container parent, pas au Pressable.
  // Sans style (bouton icône), on laisse Animated.View à sa taille naturelle.
  const hasExplicitStyle = style != null;

  return (
    <Pressable style={[style, { backgroundColor: 'transparent' }]} onPressIn={pressIn} onPressOut={pressOut} onPress={handlePress} disabled={disabled}>
      <Animated.View
        style={[
          style,
          hasExplicitStyle ? { width: '100%', height: undefined } : null,
          { transform: [{ scale }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
