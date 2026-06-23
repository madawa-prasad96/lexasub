import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    currentVocabWords, currentMovieName,
    setVocabWords, setCurrentMovieName, setCurrentDifficulty,
    setIsProcessing, setProcessingStep, updateWordAIData,
    isProcessing, processingStep, resetSession,
  } = useAppStore();

  const [movieName, setMovieName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileExt, setFileExt] = useState<'srt' | 'vtt'>('srt');
  const [level, setLevel] = useState<ExperienceLevel>(profile?.experienceLevel ?? 'Intermediate');
  const [language, setLanguage] = useState<TargetLanguage>(
    profile?.targetLanguage ?? { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
  );
  const [showLangPicker, setShowLangPicker] = useState(false);

  const hasSession = currentVocabWords.length > 0;

  const handleFilePicked = (content: string, name: string, ext: 'srt' | 'vtt') => {
    setFileContent(content);
    setFileName(name);
    setFileExt(ext);
    setMovieName(filenameWithoutExtension(name));
  };

  const handleClearFile = () => {
    setFileContent('');
    setFileName('');
    setMovieName('');
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
        {hasSession && (
          <TouchableOpacity
            style={styles.resumeCard}
            onPress={() => navigation.navigate('VocabList')}
            activeOpacity={0.85}
          >
            <View style={styles.resumeLeft}>
              <Text style={styles.resumeLabel}>Current session</Text>
              <Text style={styles.resumeMovie} numberOfLines={1}>{currentMovieName}</Text>
              <Text style={styles.resumeCount}>{currentVocabWords.length} words</Text>
            </View>
            <Text style={styles.resumeArrow}>→</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>{hasSession ? 'New Analysis' : 'Analyze a Film'}</Text>

        {fileContent === '' ? (
          <FileUploader onFilePicked={handleFilePicked} onError={msg => Alert.alert('File Error', msg)} />
        ) : (
          <View style={styles.fileRow}>
            <Text style={styles.fileIcon}>📄</Text>
            <Text style={styles.fileNameText} numberOfLines={1}>{fileName}</Text>
            <TouchableOpacity onPress={handleClearFile} style={styles.changeBtn}>
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
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
          style={[styles.analyzeBtn, (isProcessing || fileContent === '') && styles.analyzeBtnDisabled]}
          onPress={handleAnalyze}
          disabled={isProcessing || fileContent === ''}
          activeOpacity={0.85}
        >
          <Text style={styles.analyzeBtnText}>
            {isProcessing ? 'Analyzing…' : 'Analyze Movie'}
          </Text>
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
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    padding: 16,
    marginBottom: 20,
  },
  resumeLeft: { flex: 1 },
  resumeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1565C0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  resumeMovie: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  resumeCount: { fontSize: 13, color: '#555' },
  resumeArrow: { fontSize: 22, color: '#2196F3', fontWeight: '700' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 14 },

  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ddd',
    padding: 12,
  },
  fileIcon: { fontSize: 20, marginRight: 10 },
  fileNameText: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginLeft: 8,
  },
  changeBtnText: { fontSize: 13, color: '#555', fontWeight: '600' },

  label: { fontSize: 13, fontWeight: '700', color: '#555', marginTop: 18, marginBottom: 8 },
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

  analyzeBtn: {
    backgroundColor: '#2196F3', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 28,
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
