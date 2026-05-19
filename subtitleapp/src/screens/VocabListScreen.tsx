import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView,
} from 'react-native';
import { useAppStore } from '../store/appStore';
import { useUserStore } from '../store/userStore';
import { VocabWord } from '../types';
import { generateUUID } from '../utils/helpers';
import { saveMovieToBackend } from '../services/moviesApiService';
import WordCard from '../components/WordCard';
import DifficultyBadge from '../components/DifficultyBadge';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'VocabList'>;
type SortMode = 'frequency' | 'alpha' | 'cefr';
const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Unknown'];

const VocabListScreen: React.FC<Props> = ({ navigation }) => {
  const { currentVocabWords, currentMovieName, currentDifficulty } = useAppStore();
  const { profile, addSavedMovie } = useUserStore();
  const [sortMode, setSortMode] = useState<SortMode>('frequency');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const sortedWords = [...currentVocabWords].sort((a, b) => {
    if (sortMode === 'frequency') return b.frequency - a.frequency;
    if (sortMode === 'alpha') return a.word.localeCompare(b.word);
    return CEFR_ORDER.indexOf(a.cefrLevel) - CEFR_ORDER.indexOf(b.cefrLevel);
  });

  const handleSave = useCallback(async () => {
    if (!profile || !currentDifficulty || saving || saved) return;
    setSaving(true);
    try {
      const moviePayload = {
        id: generateUUID(),
        movieName: currentMovieName,
        savedAt: new Date().toISOString(),
        targetLanguage: profile.targetLanguage.label,
        experienceLevel: profile.experienceLevel,
        totalWords: currentVocabWords.length,
        words: currentVocabWords,
        difficultyEstimate: currentDifficulty,
      };
      const saved_ = await saveMovieToBackend(moviePayload);
      addSavedMovie({
        id: saved_.id,
        movieName: saved_.movieName,
        savedAt: saved_.savedAt,
        targetLanguage: saved_.targetLanguage,
        experienceLevel: saved_.experienceLevel as any,
        totalWords: saved_.totalWords,
        difficultyEstimate: saved_.difficultyEstimate,
      });
      setSaved(true);
    } catch (err) {
      Alert.alert('Save Failed', (err as Error).message);
    } finally {
      setSaving(false);
    }
  }, [currentVocabWords, currentMovieName, currentDifficulty, profile, saved, saving, addSavedMovie]);

  const renderItem = useCallback(({ item }: { item: VocabWord }) => (
    <WordCard word={item} onPress={() => navigation.navigate('WordDetail', { word: item })} />
  ), [navigation]);

  const SortButton = ({ mode, label }: { mode: SortMode; label: string }) => (
    <TouchableOpacity
      style={[styles.sortBtn, sortMode === mode && styles.sortBtnActive]}
      onPress={() => setSortMode(mode)}
    >
      <Text style={[styles.sortBtnText, sortMode === mode && styles.sortBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.movieName} numberOfLines={1}>{currentMovieName}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{currentVocabWords.length} words</Text>
        </View>
      </View>
      {currentDifficulty && <View style={styles.difficultyRow}><DifficultyBadge difficulty={currentDifficulty} /></View>}
      <View style={styles.sortBar}>
        <SortButton mode="frequency" label="Frequency" />
        <SortButton mode="alpha" label="A–Z" />
        <SortButton mode="cefr" label="CEFR" />
      </View>
      <FlatList
        data={sortedWords}
        keyExtractor={item => item.word}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.saveContainer}>
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone, saving && styles.saveBtnSaving]}
          onPress={handleSave}
          disabled={saved || saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : '💾 Save to My Movies'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  movieName: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  countBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 13, color: '#1565C0', fontWeight: '600' },
  difficultyRow: { padding: 12, paddingBottom: 4 },
  sortBar: { flexDirection: 'row', padding: 12, gap: 8 },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  sortBtnActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  sortBtnText: { fontSize: 13, color: '#666', fontWeight: '600' },
  sortBtnTextActive: { color: '#fff' },
  list: { paddingBottom: 90 },
  saveContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#f8f9fa', borderTopWidth: 1, borderTopColor: '#eee' },
  saveBtn: { backgroundColor: '#2196F3', borderRadius: 12, padding: 15, alignItems: 'center' },
  saveBtnDone: { backgroundColor: '#4CAF50' },
  saveBtnSaving: { backgroundColor: '#90CAF9' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default VocabListScreen;
