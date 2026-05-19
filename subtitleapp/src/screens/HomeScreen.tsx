import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useAppStore } from '../store/appStore';
import { useUserStore } from '../store/userStore';
import { processSubtitleFile } from '../services/subtitleParser';
import { ExperienceLevel, TargetLanguage } from '../types';
import { filenameWithoutExtension } from '../utils/helpers';
import FileUploader from '../components/FileUploader';
import LevelSelector from '../components/LevelSelector';
import LanguagePicker from '../components/LanguagePicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { profile } = useUserStore();
  const {
    setVocabWords, setCurrentMovieName, setCurrentDifficulty,
    setIsProcessing, setProcessingStep, updateWordAIData,
    isProcessing, processingStep, resetSession,
  } = useAppStore();

  const [movieName, setMovieName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileExt, setFileExt] = useState<'srt' | 'vtt'>('srt');
  const [level, setLevel] = useState<ExperienceLevel>(profile?.experienceLevel ?? 'Intermediate');
  const [language, setLanguage] = useState<TargetLanguage>(
    profile?.targetLanguage ?? { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
  );
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleFilePicked = (content: string, name: string, ext: 'srt' | 'vtt') => {
    setFileContent(content);
    setFileExt(ext);
    setMovieName(filenameWithoutExtension(name));
  };

  const handleAnalyze = async () => {
    if (!fileContent) {
      Alert.alert('No File', 'Please select a subtitle file first.');
      return;
    }
    if (!movieName.trim()) {
      Alert.alert('Missing Name', 'Please enter a movie name.');
      return;
    }

    resetSession();
    setCurrentMovieName(movieName.trim());
    setIsProcessing(true);

    try {
      await processSubtitleFile(
        fileContent,
        fileExt,
        movieName.trim(),
        language,
        level,
        step => setProcessingStep(step),
        (words, difficulty) => {
          setVocabWords(words);
          setCurrentDifficulty(difficulty);
          setIsProcessing(false);
          navigation.navigate('VocabList');
        },
        (word, contextDef, culturalNote, exampleSentence) => {
          updateWordAIData(word, contextDef, culturalNote, exampleSentence);
        },
      );
    } catch (err) {
      setIsProcessing(false);
      Alert.alert('Error', `Processing failed: ${(err as Error).message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>📖</Text>
          <Text style={styles.title}>SubtitleLearner</Text>
          <Text style={styles.subtitle}>Learn vocabulary from movies</Text>
        </View>

        <FileUploader onFilePicked={handleFilePicked} onError={msg => Alert.alert('File Error', msg)} />

        {fileContent !== '' && (
          <View style={styles.filePickedBanner}>
            <Text style={styles.filePickedText}>✓ File loaded</Text>
          </View>
        )}

        <Text style={styles.label}>Movie Name</Text>
        <TextInput
          style={styles.input}
          value={movieName}
          onChangeText={setMovieName}
          placeholder="e.g. Interstellar"
          placeholderTextColor="#bbb"
        />

        <Text style={styles.label}>Target Language</Text>
        <TouchableOpacity style={styles.langBtn} onPress={() => setShowLangPicker(true)}>
          <Text style={styles.langBtnText}>{language.label} ({language.nativeLabel})</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Your Level</Text>
        <LevelSelector selected={level} onSelect={setLevel} />

        <TouchableOpacity
          style={[styles.analyzeBtn, isProcessing && styles.analyzeBtnDisabled]}
          onPress={handleAnalyze}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          <Text style={styles.analyzeBtnText}>Analyze Movie</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.processingStep}>{processingStep}</Text>
          </View>
        </View>
      </Modal>

      <LanguagePicker
        visible={showLangPicker}
        selected={language}
        onSelect={setLanguage}
        onClose={() => setShowLangPicker(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginTop: 20, marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, padding: 13,
    fontSize: 15, color: '#1a1a1a', backgroundColor: '#fff',
  },
  langBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, padding: 13,
    backgroundColor: '#fff',
  },
  langBtnText: { fontSize: 15, color: '#1a1a1a' },
  chevron: { fontSize: 22, color: '#bbb' },
  filePickedBanner: {
    backgroundColor: '#E8F5E9', borderRadius: 8, padding: 10, marginTop: 10, alignItems: 'center',
  },
  filePickedText: { color: '#388E3C', fontWeight: '600' },
  analyzeBtn: {
    backgroundColor: '#2196F3', borderRadius: 12, padding: 16, alignItems: 'center',
    marginTop: 28,
  },
  analyzeBtnDisabled: { backgroundColor: '#90CAF9' },
  analyzeBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  processingOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  processingCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center',
    width: 260, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
  processingStep: { marginTop: 16, fontSize: 14, color: '#555', textAlign: 'center' },
});

export default HomeScreen;
