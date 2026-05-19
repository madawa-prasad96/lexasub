import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import VocabListScreen from '../screens/VocabListScreen';
import WordDetailScreen from '../screens/WordDetailScreen';
import SavedMoviesScreen from '../screens/SavedMoviesScreen';
import MovieWordListScreen from '../screens/MovieWordListScreen';
import StudyScreen from '../screens/StudyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { VocabWord } from '../types';
import { useUserStore } from '../store/userStore';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  VocabList: undefined;
  WordDetail: { word: VocabWord };
};

export type MoviesStackParamList = {
  SavedMovies: undefined;
  MovieWordList: { movieId: string };
  WordDetail: { word: VocabWord };
  Study: { movieId: string };
};

export type TabParamList = {
  HomeStack: undefined;
  Movies: undefined;
  Profile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const MoviesStack = createNativeStackNavigator<MoviesStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const HomeNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="VocabList" component={VocabListScreen} options={{ title: 'Vocabulary' }} />
    <HomeStack.Screen
      name="WordDetail"
      component={WordDetailScreen}
      options={({ route }) => ({ title: route.params.word.word })}
    />
  </HomeStack.Navigator>
);

const MoviesNavigator = () => (
  <MoviesStack.Navigator>
    <MoviesStack.Screen name="SavedMovies" component={SavedMoviesScreen} options={{ title: 'My Movies' }} />
    <MoviesStack.Screen name="MovieWordList" component={MovieWordListScreen} options={{ title: 'Word List' }} />
    <MoviesStack.Screen
      name="WordDetail"
      component={WordDetailScreen}
      options={({ route }) => ({ title: route.params.word.word })}
    />
    <MoviesStack.Screen name="Study" component={StudyScreen} options={{ title: 'Study Mode' }} />
  </MoviesStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused }) => {
        const icons: Record<string, string> = { HomeStack: '🏠', Movies: '🎬', Profile: '👤' };
        return (
          <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.6 }}>
            {icons[route.name]}
          </Text>
        );
      },
      tabBarLabel: ({ focused, children }) => (
        <Text style={{ fontSize: 10, color: focused ? '#2196F3' : '#888', marginBottom: 2 }}>
          {children}
        </Text>
      ),
    })}
  >
    <Tab.Screen name="HomeStack" component={HomeNavigator} options={{ title: 'Home' }} />
    <Tab.Screen name="Movies" component={MoviesNavigator} options={{ title: 'My Movies' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated } = useUserStore();
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
