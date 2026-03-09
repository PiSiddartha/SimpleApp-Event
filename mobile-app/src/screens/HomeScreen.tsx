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
import { colors, spacing } from '@/theme/colors';

interface HomeScreenProps {
  onEventPress: (event: Event) => void;
  onScanPress: () => void;
  onLogout?: () => void;
}

export function HomeScreen({ onEventPress, onScanPress, onLogout }: HomeScreenProps) {
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
        {onLogout ? (
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        ) : null}
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
          <ActivityIndicator size="large" color={colors.primary} />
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.sm,
  },
  logoutButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  logoutText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    gap: 10,
  },
  scanIcon: {
    fontSize: 22,
  },
  scanText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  list: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
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
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
