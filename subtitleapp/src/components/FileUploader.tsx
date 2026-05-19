import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DocumentPicker from 'react-native-document-picker';

interface Props {
  onFilePicked: (content: string, name: string, extension: 'srt' | 'vtt') => void;
  onError?: (err: string) => void;
}

const FileUploader: React.FC<Props> = ({ onFilePicked, onError }) => {
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });

      const uri = result.fileCopyUri ?? result.uri;
      const name = result.name ?? 'subtitle';
      const ext = name.split('.').pop()?.toLowerCase();

      if (ext !== 'srt' && ext !== 'vtt') {
        onError?.('Please select an .srt or .vtt subtitle file.');
        return;
      }

      const RNFS = require('react-native-fs');
      const decodedUri = decodeURIComponent(uri);
      const content = await RNFS.readFile(decodedUri, 'utf8');
      onFilePicked(content, name, ext as 'srt' | 'vtt');
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        onError?.('Failed to read file. Please try again.');
      }
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={pickFile} activeOpacity={0.8}>
      <Text style={styles.icon}>📄</Text>
      <Text style={styles.primary}>Select Subtitle File</Text>
      <Text style={styles.secondary}>Supports .srt and .vtt formats</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#F3F9FF',
  },
  icon: { fontSize: 40, marginBottom: 12 },
  primary: { fontSize: 16, fontWeight: '700', color: '#2196F3', marginBottom: 6 },
  secondary: { fontSize: 13, color: '#888' },
});

export default FileUploader;
