import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useUserStore } from '../store/userStore';
import { login, googleSignIn } from '../services/authService';
import { getMoviesFromBackend } from '../services/moviesApiService';
import { getTokens } from '../services/storageService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { setProfile, setSavedMovies, setAccessToken, setIsAuthenticated } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { user, accessToken } = await login(email.trim(), password);
      setProfile(user);
      setAccessToken(accessToken);
      setIsAuthenticated(true);
      const movies = await getMoviesFromBackend();
      setSavedMovies(movies);
    } catch (err) {
      Alert.alert('Login Failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { user, accessToken } = await googleSignIn();
      setProfile(user);
      setAccessToken(accessToken);
      setIsAuthenticated(true);
      const movies = await getMoviesFromBackend();
      setSavedMovies(movies);
    } catch (err) {
      Alert.alert('Google Sign-In Failed', (err as Error).message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <Text style={styles.logo}>📖</Text>
        <Text style={styles.title}>SubtitleLearner</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#bbb"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#bbb"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} disabled={googleLoading}>
          {googleLoading ? (
            <ActivityIndicator color="#555" />
          ) : (
            <Text style={styles.googleBtnText}>🔵  Continue with Google</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.switchText}>Don't have an account? <Text style={styles.switchLink}>Register</Text></Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, padding: 14,
    fontSize: 15, color: '#1a1a1a', backgroundColor: '#fff', marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: '#2196F3', borderRadius: 12, padding: 15,
    alignItems: 'center', marginTop: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  dividerText: { marginHorizontal: 12, color: '#aaa', fontSize: 13 },
  googleBtn: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 12, padding: 15,
    alignItems: 'center', backgroundColor: '#fff',
  },
  googleBtnText: { fontSize: 15, color: '#333', fontWeight: '600' },
  switchBtn: { marginTop: 24, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#888' },
  switchLink: { color: '#2196F3', fontWeight: '700' },
});

export default LoginScreen;
