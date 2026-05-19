import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { getTokens } from './src/services/storageService';
import { getMe, refreshAccessToken } from './src/services/authService';
import { getMoviesFromBackend } from './src/services/moviesApiService';
import { useUserStore } from './src/store/userStore';

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const { setProfile, setAccessToken, setIsAuthenticated, setSavedMovies } = useUserStore();

  useEffect(() => {
    const init = async () => {
      try {
        const tokens = await getTokens();
        if (!tokens) { setInitialized(true); return; }

        let accessToken = tokens.accessToken;

        try {
          const user = await getMe(accessToken);
          setProfile(user);
          setAccessToken(accessToken);
          setIsAuthenticated(true);
          const movies = await getMoviesFromBackend();
          setSavedMovies(movies);
        } catch {
          const newToken = await refreshAccessToken();
          if (newToken) {
            try {
              const user = await getMe(newToken);
              setProfile(user);
              setAccessToken(newToken);
              setIsAuthenticated(true);
              const movies = await getMoviesFromBackend();
              setSavedMovies(movies);
            } catch {
              // refresh worked but getMe still failed — force re-login
            }
          }
        }
      } catch (err) {
        console.warn('Init error:', err);
      } finally {
        setInitialized(true);
      }
    };
    init();
  }, [setProfile, setAccessToken, setIsAuthenticated, setSavedMovies]);

  if (!initialized) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashEmoji}>📖</Text>
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  splashEmoji: { fontSize: 64 },
});
