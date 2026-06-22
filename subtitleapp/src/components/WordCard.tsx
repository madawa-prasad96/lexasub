import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VocabWord } from '../types';
import { cefrLevelColor } from '../utils/helpers';

interface Props {
  word: VocabWord;
  onPress: () => void;
}

const WordCard: React.FC<Props> = ({ word, onPress }) => {
  const isKnownLevel = word.cefrLevel !== 'Unknown';
  const levelColor = cefrLevelColor(word.cefrLevel);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[
        styles.levelBadge,
        isKnownLevel ? { backgroundColor: levelColor } : styles.levelBadgeUnknown,
      ]}>
        <Text style={[styles.levelText, !isKnownLevel && styles.levelTextUnknown]}>
          {isKnownLevel ? word.cefrLevel : '–'}
        </Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.wordText}>{word.word}</Text>
        <Text style={styles.translationText} numberOfLines={1}>
          {word.translation || '—'}
        </Text>
        {word.timestamps[0] && (
          <Text style={styles.timeText}>⏱ {word.timestamps[0]}</Text>
        )}
      </View>

      <View style={styles.right}>
        <View style={styles.freqBadge}>
          <Text style={styles.freqText}>×{word.frequency}</Text>
        </View>
        <Text style={[styles.aiIcon, !word.isAILoaded && styles.aiIconDim]}>💡</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginVertical: 4,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  levelBadge: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelBadgeUnknown: {
    backgroundColor: '#f0f0f0',
  },
  levelText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
  },
  levelTextUnknown: {
    color: '#bbb',
    fontSize: 18,
    fontWeight: '400',
  },
  center: { flex: 1 },
  wordText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  translationText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  timeText: {
    fontSize: 11,
    color: '#aaa',
  },
  right: {
    alignItems: 'center',
    minWidth: 40,
  },
  freqBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  freqText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  aiIcon: { fontSize: 15 },
  aiIconDim: { opacity: 0.2 },
});

export default WordCard;
