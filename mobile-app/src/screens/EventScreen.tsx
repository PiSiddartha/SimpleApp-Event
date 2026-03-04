// Event Screen
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking 
} from 'react-native';
import { useEvent, useJoinEvent } from '@/hooks/useEvents';
import { usePolls } from '@/hooks/usePolls';
import { useMaterials } from '@/hooks/useMaterials';
import { PollCard } from '@/components/PollCard';
import { MaterialItem } from '@/components/MaterialItem';
import { Poll } from '@/types/poll';
import { Material } from '@/types/material';
import { api } from '@/services/api';

interface EventScreenProps {
  eventId: string;
  onBack: () => void;
}

export function EventScreen({ eventId, onBack }: EventScreenProps) {
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: pollsData, isLoading: pollsLoading } = usePolls(eventId);
  const { data: materialsData, isLoading: materialsLoading } = useMaterials(eventId);
  const joinEvent = useJoinEvent();
  const [joined, setJoined] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const polls = pollsData?.polls || pollsData || [];
  const materials = materialsData?.materials || materialsData || [];

  const handleJoin = async () => {
    try {
      await joinEvent.mutateAsync(eventId);
      setJoined(true);
      Alert.alert('Success', 'You have joined the event!');
    } catch (error: any) {
      if (error.response?.data?.message?.includes('already joined')) {
        setJoined(true);
      } else {
        Alert.alert('Error', 'Failed to join event');
      }
    }
  };

  const handleVote = (poll: Poll) => {
    // Navigate to poll voting
    Alert.alert(
      poll.question,
      'Select an option to vote',
      poll.options?.map(option => ({
        text: option.option_text,
        onPress: async () => {
          try {
            await api.castVote(poll.id, option.id);
            Alert.alert('Success', 'Your vote has been recorded!');
          } catch {
            Alert.alert('Error', 'Failed to submit vote');
          }
        }
      })) || []
    );
  };

  const handleDownload = async (material: Material) => {
    setDownloading(material.id);
    try {
      const result = await api.getDownloadUrl(material.id);
      if (result.download_url) {
        Linking.openURL(result.download_url);
      }
    } catch {
      Alert.alert('Error', 'Failed to download material');
    }
    setDownloading(null);
  };

  if (eventLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>{event.name}</Text>
          
          {event.description && (
            <Text style={styles.description}>{event.description}</Text>
          )}
        </View>

        {/* Event Info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>{formatDate(event.start_time)}</Text>
          </View>
          
          {event.location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏷️</Text>
            <Text style={styles.infoText}>{event.event_type}</Text>
          </View>
        </View>

        {/* Join Button */}
        {!joined && (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={handleJoin}
            disabled={joinEvent.isPending}
          >
            {joinEvent.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.joinButtonText}>✅ Join Event</Text>
            )}
          </TouchableOpacity>
        )}

        {joined && (
          <View style={styles.joinedBanner}>
            <Text style={styles.joinedText}>✓ You're attending this event</Text>
          </View>
        )}

        {/* Polls Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Polls</Text>
          
          {pollsLoading ? (
            <ActivityIndicator color="#0ea5e9" />
          ) : polls.length > 0 ? (
            polls.map((poll: Poll) => (
              <PollCard 
                key={poll.id} 
                poll={poll} 
                onVote={handleVote} 
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No polls available</Text>
          )}
        </View>

        {/* Materials Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Materials</Text>
          
          {materialsLoading ? (
            <ActivityIndicator color="#0ea5e9" />
          ) : materials.length > 0 ? (
            materials.map((material: Material) => (
              <MaterialItem
                key={material.id}
                material={material}
                onDownload={handleDownload}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No materials available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  section: {
    padding: 20,
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
  },
  joinButton: {
    marginHorizontal: 20,
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  joinedBanner: {
    marginHorizontal: 20,
    backgroundColor: '#dcfce7',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinedText: {
    color: '#16a34a',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
