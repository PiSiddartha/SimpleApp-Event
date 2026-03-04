// Home Screen
import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { Event } from '@/types/event';

interface HomeScreenProps {
  onEventPress: (event: Event) => void;
  onScanPress: () => void;
}

export function HomeScreen({ onEventPress, onScanPress }: HomeScreenProps) {
  const { data: events, isLoading, error } = useEvents();
  
  const renderEvent = ({ item }: { item: Event }) => (
    <EventCard 
      event={item} 
      onPress={onEventPress} 
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back! 👋</Text>
          <Text style={styles.title}>Upcoming Events</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.scanButton}
        onPress={onScanPress}
        activeOpacity={0.8}
      >
        <Text style={styles.scanIcon}>📷</Text>
        <Text style={styles.scanText}>Scan QR Code</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load events</Text>
        </View>
      ) : (
        <FlatList
          data={events || []}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No upcoming events</Text>
              <Text style={styles.emptySubtext}>
                Scan a QR code to join an event
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0ea5e9',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  scanIcon: {
    fontSize: 22,
  },
  scanText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  list: {
    padding: 20,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
