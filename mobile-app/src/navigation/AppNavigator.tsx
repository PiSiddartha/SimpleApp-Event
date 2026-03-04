// App Navigator
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { LoginScreen } from '@/screens/LoginScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { EventScreen } from '@/screens/EventScreen';
import { PollScreen } from '@/screens/PollScreen';
import { MaterialsScreen } from '@/screens/MaterialsScreen';
import { LeaderboardScreen } from '@/screens/LeaderboardScreen';
import { QRScannerScreen } from '@/screens/QRScannerScreen';
import { authService } from '@/services/auth';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          backgroundColor: '#fff',
          borderTopColor: '#e5e7eb',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 22 }}>🏠</Text>
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
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Event">
              {({ route, navigation }: any) => (
                <EventScreen
                  eventId={route.params?.eventId}
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
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 22 }}>🏆</Text>
          ),
        }}
      >
        {() => (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LeaderboardMain">
              {({ navigation }: any) => (
                <PlaceholderScreen 
                  title="Leaderboard"
                  icon="🏆"
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
  icon, 
  description,
  onAction 
}: { 
  title: string; 
  icon: string; 
  description: string;
  onAction?: () => void;
}) {
  return (
    <View style={placeholderStyles.placeholder}>
      <Text style={placeholderStyles.placeholderIcon}>{icon}</Text>
      <Text style={placeholderStyles.placeholderTitle}>{title}</Text>
      <Text style={placeholderStyles.placeholderDesc}>{description}</Text>
    </View>
  );
}

const placeholderStyles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 24,
  },
  placeholderIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  placeholderDesc: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
});

// Auth or Main App
export function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAuth();
  }, [refreshKey]);

  const checkAuth = async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
  };

  const handleLoginSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isAuthenticated === null) {
    return (
      <View style={loadingStyles.loading}>
        <Text style={loadingStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack onLoginSuccess={handleLoginSuccess} />}
    </NavigationContainer>
  );
}

// Auth Stack
function AuthStack({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {() => (
          <LoginScreen onLoginSuccess={onLoginSuccess} />
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
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
