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
import { useEvent, useJoinEvent, useEventAnalytics } from '@/hooks/useEvents';
import { usePolls } from '@/hooks/usePolls';
import { useMaterials } from '@/hooks/useMaterials';
import { PollCard } from '@/components/PollCard';
import { MaterialItem } from '@/components/MaterialItem';
import { Poll } from '@/types/poll';
import { Material } from '@/types/material';
import { api } from '@/services/api';
import { colors, spacing, borderRadius } from '@/theme/colors';

interface EventScreenProps {
  eventId: string;
  onBack: () => void;
  onPollPress?: (pollId: string) => void;
}

export function EventScreen({ eventId, onBack, onPollPress }: EventScreenProps) {
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: pollsData, isLoading: pollsLoading } = usePolls(eventId);
  const { data: materialsData, isLoading: materialsLoading } = useMaterials(eventId);
  const joinEvent = useJoinEvent();
  const { data: analytics } = useEventAnalytics(eventId);
  const [joined, setJoined] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const polls = Array.isArray(pollsData) ? pollsData : pollsData?.polls || [];
  const materials = Array.isArray(materialsData) ? materialsData : materialsData?.materials || [];
  const topStudents = analytics?.top_students ?? [];

  const handleJoin = async () => {
    try {
      await joinEvent.mutateAsync(eventId);
      setJoined(true);
      Alert.alert('Success', 'You have joined the event!');
    } catch (error: any) {
      const msg = error.response?.data?.message ?? '';
      if (msg.includes('already joined') || msg.includes('already checked into')) {
        setJoined(true);
      } else {
        Alert.alert('Error', 'Failed to join event');
      }
    }
  };

  const handleVote = (poll: Poll) => {
    if (onPollPress) {
      onPollPress(poll.id);
    } else {
      const buttons =
        poll.options?.map((option) => ({
          text: option.option_text,
          onPress: async () => {
            try {
              await api.castVote(poll.id, option.id);
              Alert.alert('Success', 'Your vote has been recorded!');
            } catch {
              Alert.alert('Error', 'Failed to submit vote');
            }
          },
        })) ?? [];
      Alert.alert(
        poll.question,
        'Select an option to vote',
        buttons.length > 0 ? buttons : [{ text: 'OK' }]
      );
    }
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
          <ActivityIndicator size="large" color={colors.primary} />
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
            <Text style={styles.infoText}>{event.event_type ?? '—'}</Text>
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
              <ActivityIndicator color={colors.white} />
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
            <ActivityIndicator color={colors.primary} />
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
            <ActivityIndicator color={colors.primary} />
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

        {/* Leaderboard Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
          {topStudents.length > 0 ? (
            topStudents.slice(0, 10).map((student: { user_id?: string; score?: number; total_actions?: number }, index: number) => (
              <View key={student?.user_id ?? `leader-${index}`} style={styles.leaderboardRow}>
                <Text style={styles.leaderboardRank}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                </Text>
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardId} numberOfLines={1}>
                    {student?.user_id
                      ? `${student.user_id.slice(0, 8)}...${student.user_id.slice(-4)}`
                      : '—'}
                  </Text>
                  <Text style={styles.leaderboardActions}>{student?.total_actions ?? 0} actions</Text>
                </View>
                <Text style={styles.leaderboardScore}>{student?.score ?? 0} pts</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No rankings yet — participate in polls and materials to appear</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.error,
    fontSize: 16,
  },
  header: {
    padding: spacing.xl,
    paddingBottom: 0,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
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
    marginHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  joinButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  joinedBanner: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.successBg,
    padding: 14,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  joinedText: {
    color: colors.success,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  leaderboardRank: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  leaderboardId: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  leaderboardActions: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  leaderboardScore: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
