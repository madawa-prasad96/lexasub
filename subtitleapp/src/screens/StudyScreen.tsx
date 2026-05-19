import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { getMovieFromBackend } from '../services/moviesApiService';
import { VocabWord } from '../types';
import StudyFlashcard from '../components/StudyFlashcard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MoviesStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<MoviesStackParamList, 'Study'>;

const StudyScreen: React.FC<Props> = ({ route, navigation }) => {
  const { movieId } = route.params;
  const [words, setWords] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [knownSet, setKnownSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getMovieFromBackend(movieId)
      .then(list => setWords(list.words))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [movieId]);

  const handleMarkKnown = () => {
    const word = words[currentIndex];
    if (!knownSet.has(word.word)) {
      setKnownSet(prev => new Set([...prev, word.word]));
      setKnownCount(c => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setDone(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setKnownCount(0);
    setKnownSet(new Set());
    setDone(false);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.summaryContainer}>
        <Text style={styles.summaryEmoji}>🎉</Text>
        <Text style={styles.summaryTitle}>Session Complete!</Text>
        <Text style={styles.summaryStat}>
          You studied {words.length} words
        </Text>
        <Text style={styles.summaryKnown}>{knownCount} marked as known</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={handleReset}>
          <Text style={styles.actionBtnText}>Study Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.outlineBtn]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.outlineBtnText}>Done</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentWord = words[currentIndex];
  if (!currentWord) return null;
  const isKnown = knownSet.has(currentWord.word);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${((currentIndex + 1) / words.length) * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{currentIndex + 1} / {words.length}</Text>
      </View>

      <View style={styles.cardContainer}>
        <StudyFlashcard
          word={currentWord}
          cardNumber={currentIndex + 1}
          total={words.length}
        />
      </View>

      <TouchableOpacity
        style={[styles.knownBtn, isKnown && styles.knownBtnActive]}
        onPress={handleMarkKnown}
      >
        <Text style={styles.knownBtnText}>
          {isKnown ? '✓ Marked as Known' : '✓ Mark as Known'}
        </Text>
      </TouchableOpacity>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navBtnText}>← Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={handleNext}>
          <Text style={styles.navBtnText}>
            {currentIndex === words.length - 1 ? 'Finish →' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', alignItems: 'center' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progressContainer: { width: '100%', padding: 16 },
  progressTrack: {
    height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, overflow: 'hidden', marginBottom: 6,
  },
  progressFill: { height: 6, backgroundColor: '#2196F3', borderRadius: 3 },
  progressText: { fontSize: 13, color: '#888', textAlign: 'right' },
  cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  knownBtn: {
    backgroundColor: '#E8F5E9', paddingVertical: 12, paddingHorizontal: 28,
    borderRadius: 24, marginBottom: 16,
  },
  knownBtnActive: { backgroundColor: '#4CAF50' },
  knownBtnText: { fontSize: 15, fontWeight: '700', color: '#388E3C' },
  navRow: { flexDirection: 'row', gap: 12, paddingBottom: 32, paddingHorizontal: 24, width: '100%' },
  navBtn: {
    flex: 1, backgroundColor: '#2196F3', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  navBtnDisabled: { backgroundColor: '#BDBDBD' },
  navBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  summaryContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#f8f9fa',
  },
  summaryEmoji: { fontSize: 64, marginBottom: 16 },
  summaryTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  summaryStat: { fontSize: 16, color: '#555', marginBottom: 4 },
  summaryKnown: { fontSize: 18, fontWeight: '700', color: '#4CAF50', marginBottom: 32 },
  actionBtn: {
    backgroundColor: '#2196F3', borderRadius: 12, paddingVertical: 14,
    paddingHorizontal: 40, marginBottom: 12, width: '100%', alignItems: 'center',
  },
  outlineBtn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#2196F3' },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outlineBtnText: { color: '#2196F3', fontSize: 16, fontWeight: '700' },
});

export default StudyScreen;
