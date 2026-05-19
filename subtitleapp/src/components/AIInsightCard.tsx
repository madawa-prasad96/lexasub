import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
  contextDefinition?: string;
  culturalNote?: string | null;
  exampleSentence?: string;
  isLoading: boolean;
}

const SkeletonLine: React.FC<{ width: string }> = ({ width }) => (
  <View style={[styles.skeletonLine, { width: width as any }]} />
);

const AIInsightCard: React.FC<Props> = ({
  contextDefinition,
  culturalNote,
  exampleSentence,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2196F3" style={{ marginBottom: 12 }} />
        <SkeletonLine width="100%" />
        <SkeletonLine width="85%" />
        <SkeletonLine width="70%" />
      </View>
    );
  }

  return (
    <View>
      {contextDefinition && (
        <View style={styles.contextCard}>
          <Text style={styles.cardIcon}>💡</Text>
          <Text style={styles.cardTitle}>Context Definition</Text>
          <Text style={styles.cardBody}>{contextDefinition}</Text>
        </View>
      )}

      {culturalNote && (
        <View style={styles.culturalCard}>
          <Text style={styles.cardIcon}>🌍</Text>
          <Text style={styles.cardTitle}>Cultural Note</Text>
          <Text style={styles.cardBody}>{culturalNote}</Text>
        </View>
      )}

      {exampleSentence && (
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleLabel}>Example</Text>
          <Text style={styles.exampleText}>"{exampleSentence}"</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { padding: 16, alignItems: 'center' },
  skeletonLine: {
    height: 14,
    backgroundColor: '#e8e8e8',
    borderRadius: 7,
    marginBottom: 8,
  },
  contextCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  culturalCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardIcon: { fontSize: 20, marginBottom: 6 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 6, letterSpacing: 0.5 },
  cardBody: { fontSize: 15, color: '#222', lineHeight: 22 },
  exampleContainer: { paddingVertical: 8 },
  exampleLabel: { fontSize: 12, fontWeight: '700', color: '#999', marginBottom: 4 },
  exampleText: { fontSize: 15, color: '#444', fontStyle: 'italic', lineHeight: 22 },
});

export default AIInsightCard;
