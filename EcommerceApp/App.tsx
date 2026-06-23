import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from './src/hooks/redux';
import { loadFavorites } from './src/store/slices/favoriteSlice';
import { initializeCart } from './src/store/slices/cartSlice';
import { theme } from './src/theme/theme';

const AppInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadFavorites());
    dispatch(initializeCart());
  }, [dispatch]);

  return <AppNavigator />;
};

const App = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Provider store={store}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={theme.colors.background}
            translucent={false}
          />
          <AppInitializer />
        </Provider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default App;
