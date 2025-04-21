import React from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export function HapticTab({ onPress, ...props }: BottomTabBarButtonProps) {
  const handlePress = React.useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress && onPress();
  }, [onPress]);

  return <props.ButtonComponent onPress={handlePress} {...props} />;
}
