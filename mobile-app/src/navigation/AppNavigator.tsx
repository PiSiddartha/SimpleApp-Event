// App Navigator
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { LoginScreen } from '@/screens/LoginScreen';
import { AuthHomeScreen } from '@/screens/AuthHomeScreen';
import { SignUpScreen } from '@/screens/SignUpScreen';
import { ConfirmSignUpScreen } from '@/screens/ConfirmSignUpScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { EventScreen } from '@/screens/EventScreen';
import { PollScreen } from '@/screens/PollScreen';
import { MaterialsScreen } from '@/screens/MaterialsScreen';
import { LeaderboardScreen } from '@/screens/LeaderboardScreen';
import { QRScannerScreen } from '@/screens/QRScannerScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { colors, spacing } from '@/theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
function MainTabs({ onLogout }: { onLogout: (() => void) | null }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowIcon: true,
        tabBarStyle: {
          height: 56,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: colors.backgroundCard,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size ?? 24} color={color} />
          ),
        }}
      >
        {() => (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain">
              {({ navigation }: any) => (
                <HomeScreen
                  onEventPress={(event) =>
                    navigation.navigate('Event', { eventId: event.id })
                  }
                  onScanPress={() =>
                    navigation.navigate('QRScanner')
                  }
                  onProfilePress={() => navigation.navigate('Profile')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Profile">
              {({ navigation }: any) => (
                <ProfileScreen
                  onBack={() => navigation.goBack()}
                  onLogout={onLogout ? () => onLogout() : () => {}}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Event">
              {({ route, navigation }: any) => (
                <EventScreen
                  eventId={route.params?.eventId}
                  onBack={() => navigation.goBack()}
                  onPollPress={(pollId) => navigation.navigate('Poll', { pollId })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Poll">
              {({ route, navigation }: any) => (
                <PollScreen
                  pollId={route.params?.pollId}
                  onBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="QRScanner">
              {({ navigation }: any) => (
                <QRScannerScreen
                  onScanSuccess={(eventId) => 
                    navigation.replace('Event', { eventId })
                  }
                  onBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </Tab.Screen>
      
      <Tab.Screen
        name="Leaderboard"
        options={{
          tabBarLabel: 'Leaderboard',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'podium' : 'podium-outline'} size={size ?? 24} color={color} />
          ),
        }}
      >
        {() => (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LeaderboardMain">
              {({ navigation }: any) => (
                <PlaceholderScreen 
                  title="Leaderboard"
                  description="Join an event to see the leaderboard"
                  onAction={() => navigation.navigate('Home')}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Placeholder screen component
function PlaceholderScreen({
  title,
  description,
  onAction,
}: {
  title: string;
  description: string;
  onAction?: () => void;
}) {
  return (
    <View style={placeholderStyles.placeholder}>
      <Text style={placeholderStyles.placeholderTitle}>{title}</Text>
      <Text style={placeholderStyles.placeholderDesc}>{description}</Text>
      {onAction ? (
        <TouchableOpacity style={placeholderStyles.actionButton} onPress={onAction} activeOpacity={0.7}>
          <Text style={placeholderStyles.actionButtonText}>View Events</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const placeholderStyles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xxl,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  placeholderDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.sm,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

// Auth or Main App – load auth after Amplify config so we don't trigger Amplify before it's ready
export function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [logoutFn, setLogoutFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('@/config/amplify')
      .then(() => import('@/services/auth'))
      .then(({ authService }) => {
        if (cancelled) return;
        authService.setOnUnauthorized(() => setRefreshKey((k) => k + 1));
        setLogoutFn(() => () => authService.logout());
        return authService.isAuthenticated();
      })
      .then((authenticated) => {
        if (!cancelled) setIsAuthenticated(!!authenticated);
      })
      .catch(() => {
        if (!cancelled) setIsAuthenticated(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleLoginSuccessStable = React.useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={loadingStyles.loading}>
        <Text style={loadingStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainTabs onLogout={logoutFn} />
      ) : (
        <AuthStack onLoginSuccess={handleLoginSuccessStable} />
      )}
    </NavigationContainer>
  );
}

// Auth Stack: AuthHome (entry) → Sign In → Login | Create account → SignUp → ConfirmSignUp → Login
function AuthStack({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AuthHome">
      <Stack.Screen name="AuthHome">
        {({ navigation }) => (
          <AuthHomeScreen
            onSignIn={() => navigation.navigate('Login')}
            onCreateAccount={() => navigation.navigate('SignUp')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Login">
        {({ navigation }) => (
          <LoginScreen
            onLoginSuccess={onLoginSuccess}
            onCreateAccount={() => navigation.navigate('SignUp')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="SignUp">
        {({ navigation }) => (
          <SignUpScreen
            onSuccess={(email) => navigation.navigate('ConfirmSignUp', { email })}
            onSignIn={() => navigation.navigate('Login')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ConfirmSignUp">
        {({ route, navigation }) => (
          <ConfirmSignUpScreen
            email={route.params?.email ?? ''}
            onSuccess={() => navigation.navigate('Login')}
            onResend={() => {}}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const loadingStyles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
