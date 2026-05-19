import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { VocabWord } from '../types';
import AIInsightCard from '../components/AIInsightCard';
import { cefrLevelColor } from '../utils/helpers';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'WordDetail'>;

const WordDetailScreen: React.FC<Props> = ({ route }) => {
  const { word } = route.params;
  const levelColor = cefrLevelColor(word.cefrLevel);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
          <Text style={styles.levelBadgeText}>{word.cefrLevel}</Text>
        </View>

        <Text style={styles.wordHeading}>{word.word}</Text>
        <Text style={styles.translation}>{word.translation}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Appears {word.frequency}× in this film</Text>
        </View>

        <Text style={styles.sectionTitle}>TIMESTAMPS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timestampScroll}>
          {word.timestamps.map((ts, idx) => (
            <View key={idx} style={styles.tsPill}>
              <Text style={styles.tsText}>{ts}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>SUBTITLE LINES</Text>
        {word.subtitleLines.map((line, idx) => (
          <View key={idx} style={styles.quoteCard}>
            <Text style={styles.quoteText}>"{line}"</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>AI INSIGHTS</Text>
        <AIInsightCard
          contextDefinition={word.contextDefinition}
          culturalNote={word.culturalNote}
          exampleSentence={word.exampleSentence}
          isLoading={!word.isAILoaded}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20, paddingBottom: 40 },
  levelBadge: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start',
    marginBottom: 12,
  },
  levelBadgeText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  wordHeading: { fontSize: 36, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  translation: { fontSize: 22, color: '#2196F3', fontWeight: '600', marginBottom: 16 },
  metaRow: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  metaText: { color: '#555', fontSize: 14 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#999', letterSpacing: 1,
    marginTop: 20, marginBottom: 10,
  },
  timestampScroll: { marginBottom: 4 },
  tsPill: {
    backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, marginRight: 8,
  },
  tsText: { fontSize: 12, color: '#1565C0', fontFamily: 'monospace' },
  quoteCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: '#2196F3',
  },
  quoteText: { fontSize: 14, color: '#444', lineHeight: 20, fontStyle: 'italic' },
});

export default WordDetailScreen;
