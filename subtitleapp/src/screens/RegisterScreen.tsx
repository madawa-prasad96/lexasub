import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useUserStore } from '../store/userStore';
import { register } from '../services/authService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { setProfile, setAccessToken, setIsAuthenticated } = useUserStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { user, accessToken } = await register(name.trim(), email.trim(), password);
      setProfile(user);
      setAccessToken(accessToken);
      setIsAuthenticated(true);
    } catch (err) {
      Alert.alert('Registration Failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>📖</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start learning vocabulary from movies</Text>

          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
          />
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
            placeholder="Password (min 6 chars)"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#bbb"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.switchText}>Already have an account? <Text style={styles.switchLink}>Sign In</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  inner: { justifyContent: 'center', padding: 28, paddingTop: 60 },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, padding: 14,
    fontSize: 15, color: '#1a1a1a', backgroundColor: '#fff', marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: '#2196F3', borderRadius: 12, padding: 15,
    alignItems: 'center', marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchBtn: { marginTop: 24, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#888' },
  switchLink: { color: '#2196F3', fontWeight: '700' },
});

export default RegisterScreen;
