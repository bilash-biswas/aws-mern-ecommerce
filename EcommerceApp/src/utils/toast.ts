import { Alert, Platform, ToastAndroid } from 'react-native';

export const showToast = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'success',
) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(
      type === 'success'
        ? 'Success'
        : type === 'error'
        ? 'Error'
        : type === 'info'
        ? 'Info'
        : 'Warning',
      message,
      [{ text: 'OK', onPress: () => {} }],
      { cancelable: false },
    );
  }
};
