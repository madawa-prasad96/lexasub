import { BACKEND_URL, GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '../config';
import { UserProfile } from '../types';
import { saveTokens, getTokens, clearTokens, StoredTokens } from './storageService';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  offlineAccess: false,
});

const apiPost = async (path: string, body: object, token?: string): Promise<any> => {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data;
};

export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const data = await apiPost('/auth/register', { name, email, password });
  await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const data = await apiPost('/auth/login', { email, password });
  await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
};

export const googleSignIn = async (): Promise<AuthResponse> => {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  const idToken = (response as any).data?.idToken ?? (response as any).idToken;
  if (!idToken) throw new Error('No ID token received from Google');
  const data = await apiPost('/auth/google', { idToken });
  await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const tokens = await getTokens();
  if (!tokens?.refreshToken) return null;
  try {
    const data = await apiPost('/auth/refresh', { refreshToken: tokens.refreshToken });
    await saveTokens({ accessToken: data.accessToken, refreshToken: tokens.refreshToken });
    return data.accessToken;
  } catch {
    await clearTokens();
    return null;
  }
};

export const logout = async (refreshToken: string): Promise<void> => {
  try {
    const tokens = await getTokens();
    await apiPost('/auth/logout', { refreshToken: tokens?.refreshToken ?? refreshToken });
    await GoogleSignin.signOut().catch(() => {});
  } catch {}
  await clearTokens();
};

export const getMe = async (accessToken: string): Promise<UserProfile> => {
  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
};

export const updatePreferences = async (
  accessToken: string,
  experienceLevel: string,
  targetLangCode: string,
  targetLangLabel: string,
  targetLangNative: string,
): Promise<void> => {
  await fetch(`${BACKEND_URL}/users/me/preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ experienceLevel, targetLangCode, targetLangLabel, targetLangNative }),
  });
};
