import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ExperienceLevel } from '../types';

const LEVELS: { level: ExperienceLevel; description: string }[] = [
  { level: 'Beginner', description: 'Show all vocabulary' },
  { level: 'Elementary', description: 'Skip basic A1 words' },
  { level: 'Intermediate', description: 'Skip A1–A2 words' },
  { level: 'Advanced', description: 'Show B2+ only' },
];

interface Props {
  selected: ExperienceLevel;
  onSelect: (level: ExperienceLevel) => void;
}

const LevelSelector: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <View style={styles.grid}>
      {LEVELS.map(({ level, description }) => {
        const isSelected = selected === level;
        return (
          <TouchableOpacity
            key={level}
            style={[styles.button, isSelected && styles.buttonSelected]}
            onPress={() => onSelect(level)}
            activeOpacity={0.8}
          >
            <Text style={[styles.levelText, isSelected && styles.levelTextSelected]}>
              {level}
            </Text>
            <Text style={[styles.descText, isSelected && styles.descTextSelected]}>
              {description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    width: '47%',
    borderWidth: 1.5,
    borderColor: '#2196F3',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  levelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },
  levelTextSelected: {
    color: '#fff',
  },
  descText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  descTextSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
});

export default LevelSelector;
