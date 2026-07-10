import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from './src/theme/colors';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import LoginScreen from './src/screens/auth/LoginScreen';
import VenueDetailsScreen from './src/screens/explore/VenueDetailsScreen';
import BookingScreen from './src/screens/explore/BookingScreen';
import BookingDetailsScreen from './src/screens/activity/BookingDetailsScreen';
import GameDetailsScreen from './src/screens/play/GameDetailsScreen';
import QuickPlayScreen from './src/screens/home/QuickPlayScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import MyTournamentsScreen from './src/screens/profile/MyTournamentsScreen';
import PaymentsScreen from './src/screens/profile/PaymentsScreen';
import NotificationsScreen from './src/screens/profile/NotificationsScreen';
import PrivacySecurityScreen from './src/screens/profile/PrivacySecurityScreen';
import HelpSupportScreen from './src/screens/profile/HelpSupportScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainApp" component={MainTabNavigator} />
          <Stack.Screen name="VenueDetails" component={VenueDetailsScreen} />
          <Stack.Screen name="BookingUI" component={BookingScreen} />
          <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
          <Stack.Screen name="GameDetails" component={GameDetailsScreen} />
          <Stack.Screen name="QuickPlay" component={QuickPlayScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="MyTournaments" component={MyTournamentsScreen} />
          <Stack.Screen name="Payments" component={PaymentsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <AuthProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: colors.primary,
              background: colors.background,
              card: colors.surface,
              text: colors.text,
              border: colors.surfaceLight,
              notification: colors.accent,
            },
          }}
        >
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
