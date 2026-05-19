import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MovieDifficulty } from '../types';

interface Props {
  difficulty: MovieDifficulty;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#4CAF50',
  Moderate: '#FFC107',
  Challenging: '#FF9800',
  'Very Hard': '#F44336',
};

const CEFR_COLORS: Record<string, string> = {
  A1: '#4CAF50', A2: '#009688', B1: '#2196F3', B2: '#9C27B0',
  C1: '#FF9800', C2: '#F44336', Unknown: '#9E9E9E',
};

const DifficultyBadge: React.FC<Props> = ({ difficulty }) => {
  const [expanded, setExpanded] = useState(false);
  const color = DIFFICULTY_COLORS[difficulty.overallDifficulty] ?? '#9E9E9E';

  const breakdownEntries = Object.entries(difficulty.cefrBreakdown)
    .filter(([, v]) => v > 0)
    .sort((a, b) => {
      const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Unknown'];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });

  return (
    <>
      <TouchableOpacity
        style={[styles.badge, { backgroundColor: color }]}
        onPress={() => setExpanded(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.badgeText}>
          {difficulty.overallDifficulty} · {difficulty.difficultyScore}/10
        </Text>
      </TouchableOpacity>

      <Modal visible={expanded} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setExpanded(false)}>
          <View style={styles.sheet}>
            <View style={[styles.sheetBadge, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>
                {difficulty.overallDifficulty} · {difficulty.difficultyScore}/10
              </Text>
            </View>
            <Text style={styles.verdict}>{difficulty.verdict}</Text>
            <Text style={styles.newWords}>
              ~{difficulty.estimatedNewWords} new words for your level
            </Text>
            <Text style={styles.sectionTitle}>CEFR Breakdown</Text>
            {breakdownEntries.map(([level, pct]) => (
              <View key={level} style={styles.barRow}>
                <Text style={[styles.barLabel, { color: CEFR_COLORS[level] }]}>{level}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${pct}%`, backgroundColor: CEFR_COLORS[level] },
                    ]}
                  />
                </View>
                <Text style={styles.barPct}>{pct}%</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  sheetBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  verdict: { fontSize: 15, color: '#333', textAlign: 'center', marginBottom: 8 },
  newWords: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 12,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 36, fontSize: 12, fontWeight: '700' },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: { height: 10, borderRadius: 5 },
  barPct: { width: 36, fontSize: 12, color: '#666', textAlign: 'right' },
});

export default DifficultyBadge;
