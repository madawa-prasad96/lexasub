import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useUserStore } from '../store/userStore';
import { getMoviesFromBackend, deleteMovieFromBackend } from '../services/moviesApiService';
import { formatRelativeDate } from '../utils/helpers';
import DifficultyBadge from '../components/DifficultyBadge';
import { SavedMovieWordList } from '../types';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/AppNavigator';

type Props = BottomTabScreenProps<TabParamList, 'Movies'>;

const SavedMoviesScreen: React.FC<Props> = ({ navigation }) => {
  const { savedMovies, setSavedMovies, removeSavedMovie } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovies = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const movies = await getMoviesFromBackend();
      setSavedMovies(movies);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchMovies(true); }, []);

  const handleDelete = (movie: Omit<SavedMovieWordList, 'words'>) => {
    Alert.alert('Delete Movie', `Remove "${movie.movieName}" and all its words?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteMovieFromBackend(movie.id);
            removeSavedMovie(movie.id);
          } catch (err) {
            Alert.alert('Error', (err as Error).message);
          }
        },
      },
    ]);
  };

  if (savedMovies.length === 0 && !refreshing) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎬</Text>
        <Text style={styles.emptyTitle}>No Saved Movies</Text>
        <Text style={styles.emptySubtitle}>Analyze a subtitle file and save the word list to see it here.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={savedMovies}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchMovies()} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => (navigation as any).navigate('MovieWordList', { movieId: item.id })}
            activeOpacity={0.85}
          >
            <View style={styles.cardMain}>
              <Text style={styles.movieName} numberOfLines={1}>{item.movieName}</Text>
              <Text style={styles.meta}>
                {formatRelativeDate(item.savedAt)} · {item.totalWords} words · {item.targetLanguage}
              </Text>
              <View style={styles.badgeRow}>
                <DifficultyBadge difficulty={item.difficultyEstimate} />
              </View>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
  list: { padding: 12, paddingBottom: 24 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardMain: { flex: 1 },
  movieName: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  meta: { fontSize: 12, color: '#888', marginBottom: 8 },
  badgeRow: { flexDirection: 'row' },
  deleteBtn: { padding: 8 },
  deleteBtnText: { fontSize: 20 },
});

export default SavedMoviesScreen;
