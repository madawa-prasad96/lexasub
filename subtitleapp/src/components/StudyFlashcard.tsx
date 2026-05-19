import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { VocabWord } from '../types';

const { width } = Dimensions.get('window');

interface Props {
  word: VocabWord;
  cardNumber: number;
  total: number;
}

const StudyFlashcard: React.FC<Props> = ({ word, cardNumber, total }) => {
  const [flipped, setFlipped] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const frontInterpolate = animValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = animValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const flip = () => {
    Animated.spring(animValue, {
      toValue: flipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(prev => !prev);
  };

  return (
    <TouchableOpacity onPress={flip} activeOpacity={0.95} style={styles.container}>
      <Animated.View
        style={[styles.card, styles.front, { transform: [{ rotateY: frontInterpolate }] }]}
      >
        <Text style={styles.progressText}>{cardNumber} / {total}</Text>
        <Text style={styles.wordText}>{word.word}</Text>
        <Text style={styles.hintText}>Tap to reveal</Text>
      </Animated.View>

      <Animated.View
        style={[styles.card, styles.back, { transform: [{ rotateY: backInterpolate }] }]}
      >
        <Text style={styles.translationText}>{word.translation}</Text>
        {word.contextDefinition && (
          <Text style={styles.definitionText} numberOfLines={4}>
            {word.contextDefinition}
          </Text>
        )}
        {word.culturalNote && (
          <View style={styles.culturalNoteBox}>
            <Text style={styles.culturalNoteText} numberOfLines={3}>
              🌍 {word.culturalNote}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { width: width - 48, height: 300 },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  front: { backgroundColor: '#fff' },
  back: { backgroundColor: '#E3F2FD' },
  progressText: { position: 'absolute', top: 16, right: 20, fontSize: 12, color: '#bbb' },
  wordText: { fontSize: 36, fontWeight: '800', color: '#1a1a1a', textAlign: 'center' },
  hintText: { position: 'absolute', bottom: 20, fontSize: 12, color: '#bbb' },
  translationText: { fontSize: 28, fontWeight: '700', color: '#1565C0', marginBottom: 12, textAlign: 'center' },
  definitionText: { fontSize: 14, color: '#444', textAlign: 'center', lineHeight: 20 },
  culturalNoteBox: {
    marginTop: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 10,
  },
  culturalNoteText: { fontSize: 12, color: '#555', textAlign: 'center' },
});

export default StudyFlashcard;
