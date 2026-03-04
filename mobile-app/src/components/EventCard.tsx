// Event Card Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  onPress: (event: Event) => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return '#22c55e';
      case 'published': return '#3b82f6';
      case 'completed': return '#8b5cf6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(event)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{event.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
            {event.status}
          </Text>
        </View>
      </View>
      
      {event.description && (
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
      )}
      
      <View style={styles.footer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>📅</Text>
          <Text style={styles.infoText}>{formatDate(event.start_time)}</Text>
        </View>
        
        {event.location && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>📍</Text>
            <Text style={styles.infoText} numberOfLines={1}>{event.location}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
});
