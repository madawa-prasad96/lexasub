import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { TargetLanguage } from '../types';
import { SUPPORTED_LANGUAGES } from '../services/translationService';

interface Props {
  visible: boolean;
  selected: TargetLanguage | null;
  onSelect: (lang: TargetLanguage) => void;
  onClose: () => void;
}

const LanguagePicker: React.FC<Props> = ({ visible, selected, onSelect, onClose }) => {
  const [search, setSearch] = useState('');

  const filtered = SUPPORTED_LANGUAGES.filter(
    l =>
      l.label.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeLabel.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (lang: TargetLanguage) => {
    onSelect(lang);
    setSearch('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Language</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.search}
          placeholder="Search languages..."
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
        <FlatList
          data={filtered}
          keyExtractor={item => item.code}
          renderItem={({ item }) => {
            const isSelected = selected?.code === item.code;
            return (
              <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
                <View>
                  <Text style={styles.langLabel}>{item.label}</Text>
                  <Text style={styles.nativeLabel}>{item.nativeLabel}</Text>
                </View>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 18, fontWeight: '700' },
  closeBtn: { fontSize: 16, color: '#2196F3' },
  search: {
    margin: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  langLabel: { fontSize: 16, fontWeight: '600', color: '#222' },
  nativeLabel: { fontSize: 13, color: '#888', marginTop: 2 },
  checkmark: { fontSize: 20, color: '#2196F3', fontWeight: '700' },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 16 },
});

export default LanguagePicker;
