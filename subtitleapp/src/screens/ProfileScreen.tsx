import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Modal, SafeAreaView,
} from 'react-native';
import { useUserStore } from '../store/userStore';
import { ExperienceLevel, TargetLanguage } from '../types';
import { getInitials } from '../utils/helpers';
import LevelSelector from '../components/LevelSelector';
import LanguagePicker from '../components/LanguagePicker';
import { logout, updatePreferences } from '../services/authService';
import { getTokens } from '../services/storageService';

const ProfileScreen: React.FC = () => {
  const {
    profile, savedMovies, accessToken,
    updateTargetLanguage, updateExperienceLevel, signOut,
  } = useUserStore();
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  if (!profile) return null;

  const handleLevelChange = async (level: ExperienceLevel) => {
    try {
      const tokens = await getTokens();
      if (tokens?.accessToken) {
        await updatePreferences(
          tokens.accessToken, level,
          profile.targetLanguage.code,
          profile.targetLanguage.label,
          profile.targetLanguage.nativeLabel,
        );
      }
      updateExperienceLevel(level);
      setShowLevelModal(false);
    } catch { Alert.alert('Error', 'Failed to update level.'); }
  };

  const handleLangChange = async (lang: TargetLanguage) => {
    try {
      const tokens = await getTokens();
      if (tokens?.accessToken) {
        await updatePreferences(
          tokens.accessToken, profile.experienceLevel,
          lang.code, lang.label, lang.nativeLabel,
        );
      }
      updateTargetLanguage(lang);
    } catch { Alert.alert('Error', 'Failed to update language.'); }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          const tokens = await getTokens();
          await logout(tokens?.refreshToken ?? '');
          signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
        </View>

        <Text style={styles.nameText}>{profile.name}</Text>
        <Text style={styles.emailText}>{profile.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{savedMovies.length}</Text>
            <Text style={styles.statLabel}>Movies</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{savedMovies.reduce((s, m) => s + m.totalWords, 0)}</Text>
            <Text style={styles.statLabel}>Total Words</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <TouchableOpacity style={styles.row} onPress={() => setShowLevelModal(true)}>
            <Text style={styles.rowLabel}>Experience Level</Text>
            <Text style={styles.rowValue}>{profile.experienceLevel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => setShowLangPicker(true)}>
            <Text style={styles.rowLabel}>Target Language</Text>
            <Text style={styles.rowValue}>{profile.targetLanguage.label}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <Modal visible={showLevelModal} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowLevelModal(false)}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Experience Level</Text>
              <LevelSelector selected={profile.experienceLevel} onSelect={handleLevelChange} />
            </View>
          </TouchableOpacity>
        </Modal>

        <LanguagePicker
          visible={showLangPicker}
          selected={profile.targetLanguage}
          onSelect={handleLangChange}
          onClose={() => setShowLangPicker(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { alignItems: 'center', padding: 24, paddingBottom: 40 },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#2196F3',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  nameText: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  emailText: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 20 },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 20,
    marginBottom: 24, width: '100%',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#2196F3' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#eee' },
  section: { width: '100%', marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#999', letterSpacing: 1, marginBottom: 10 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  rowLabel: { fontSize: 15, color: '#333' },
  rowValue: { fontSize: 15, color: '#2196F3', fontWeight: '600' },
  logoutBtn: {
    borderWidth: 1.5, borderColor: '#F44336', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center',
  },
  logoutBtnText: { color: '#F44336', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
});

export default ProfileScreen;
