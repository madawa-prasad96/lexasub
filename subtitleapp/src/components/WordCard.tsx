import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { VocabWord } from '../types';
import { cefrLevelColor } from '../utils/helpers';

interface Props {
  word: VocabWord;
  onPress: () => void;
}

const WordCard: React.FC<Props> = ({ word, onPress }) => {
  const levelColor = cefrLevelColor(word.cefrLevel);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.levelCircle, { backgroundColor: levelColor }]}>
        <Text style={styles.levelText}>{word.cefrLevel === 'Unknown' ? '?' : word.cefrLevel}</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.wordText}>{word.word}</Text>
        <Text style={styles.translationText} numberOfLines={1}>
          {word.translation || '—'}
        </Text>
        {word.timestamps[0] && (
          <View style={styles.timePill}>
            <Text style={styles.timeText}>{word.timestamps[0]}</Text>
          </View>
        )}
      </View>
      <View style={styles.right}>
        <Text style={styles.frequencyText}>×{word.frequency}</Text>
        {word.isAILoaded ? (
          <Text style={styles.aiIcon}>💡</Text>
        ) : (
          <ActivityIndicator size="small" color="#ccc" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 5,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  levelCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  center: { flex: 1 },
  wordText: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  translationText: { fontSize: 13, color: '#666', marginBottom: 4 },
  timePill: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  timeText: { fontSize: 10, color: '#888' },
  right: { alignItems: 'center', minWidth: 40 },
  frequencyText: { fontSize: 12, color: '#999', marginBottom: 4 },
  aiIcon: { fontSize: 16 },
});

export default WordCard;
