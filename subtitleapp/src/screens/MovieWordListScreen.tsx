import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { getMovieFromBackend, deleteMovieFromBackend } from '../services/moviesApiService';
import { useUserStore } from '../store/userStore';
import { SavedMovieWordList, VocabWord } from '../types';
import WordCard from '../components/WordCard';
import DifficultyBadge from '../components/DifficultyBadge';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MoviesStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<MoviesStackParamList, 'MovieWordList'>;

const MovieWordListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { movieId } = route.params;
  const { removeSavedMovie } = useUserStore();
  const [movieList, setMovieList] = useState<SavedMovieWordList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMovieFromBackend(movieId)
      .then(setMovieList)
      .catch(err => Alert.alert('Error', (err as Error).message))
      .finally(() => setLoading(false));
  }, [movieId]);

  const handleDelete = useCallback(() => {
    if (!movieList) return;
    Alert.alert('Delete Movie', `Remove "${movieList.movieName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteMovieFromBackend(movieId);
            removeSavedMovie(movieId);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', (err as Error).message);
          }
        },
      },
    ]);
  }, [movieList, movieId, removeSavedMovie, navigation]);

  useEffect(() => {
    if (!movieList) return;
    navigation.setOptions({
      title: movieList.movieName,
      headerRight: () => (
        <TouchableOpacity onPress={handleDelete} style={{ marginRight: 8 }}>
          <Text style={{ fontSize: 20 }}>🗑</Text>
        </TouchableOpacity>
      ),
    });
  }, [movieList, navigation, handleDelete]);

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#2196F3" /></View>;
  if (!movieList) return null;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={movieList.words}
        keyExtractor={item => item.word}
        ListHeaderComponent={() => (
          <View style={styles.headerBlock}>
            <DifficultyBadge difficulty={movieList.difficultyEstimate} />
            <Text style={styles.wordCount}>{movieList.totalWords} words</Text>
            <TouchableOpacity
              style={styles.studyBtn}
              onPress={() => navigation.navigate('Study', { movieId })}
            >
              <Text style={styles.studyBtnText}>📚 Study Mode</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }: { item: VocabWord }) => (
          <WordCard word={item} onPress={() => navigation.navigate('WordDetail', { word: item })} />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBlock: { padding: 16, gap: 10 },
  wordCount: { fontSize: 14, color: '#888', fontWeight: '600' },
  studyBtn: { backgroundColor: '#2196F3', borderRadius: 10, padding: 12, alignItems: 'center' },
  studyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { paddingBottom: 24 },
});

export default MovieWordListScreen;
