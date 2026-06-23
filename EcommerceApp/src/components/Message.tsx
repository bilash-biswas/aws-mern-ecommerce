import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme/theme';

interface MessageProps {
  variant?: 'info' | 'error' | 'success' | 'warning';
  message: string;
}

const Message: React.FC<MessageProps> = ({ variant = 'info', message }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'error':
        return 'rgba(239, 68, 68, 0.15)';
      case 'success':
        return 'rgba(16, 185, 129, 0.15)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.15)';
      default:
        return 'rgba(99, 102, 241, 0.15)';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'error':
        return theme.colors.danger;
      case 'success':
        return theme.colors.secondary;
      case 'warning':
        return theme.colors.accent;
      default:
        return theme.colors.primaryLight;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'error':
        return 'rgba(239, 68, 68, 0.3)';
      case 'success':
        return 'rgba(16, 185, 129, 0.3)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.3)';
      default:
        return 'rgba(99, 102, 241, 0.3)';
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor()
      }
    ]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.roundness.sm,
    marginVertical: 8,
    borderWidth: 1,
  },
  text: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Message;
