// Leaderboard Screen
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
import { useEventAnalytics } from '@/hooks/useEvents';

interface LeaderboardScreenProps {
  eventId: string;
  onBack: () => void;
}

export function LeaderboardScreen({ eventId, onBack }: LeaderboardScreenProps) {
  const { data: analytics, isLoading, error } = useEventAnalytics(eventId);

  const topStudents = analytics?.top_students || [];

  const renderStudent = ({ item, index }: { item: any; index: number }) => {
    const getRankEmoji = (rank: number) => {
      switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return `${rank}`;
      }
    };

    const getRankStyle = (rank: number) => {
      switch (rank) {
        case 1: return { backgroundColor: '#fef3c7', color: '#d97706' };
        case 2: return { backgroundColor: '#f3f4f6', color: '#6b7280' };
        case 3: return { backgroundColor: '#fef3c7', color: '#b45309' };
        default: return { backgroundColor: '#f9fafb', color: '#6b7280' };
      }
    };

    const rankStyle = getRankStyle(index + 1);

    return (
      <View style={styles.studentRow}>
        <View style={[styles.rankBadge, { backgroundColor: rankStyle.backgroundColor }]}>
          <Text style={[styles.rankText, { color: rankStyle.color }]}>
            {getRankEmoji(index + 1)}
          </Text>
        </View>
        
        <View style={styles.studentInfo}>
          <Text style={styles.studentId}>
            {item.user_id.slice(0, 8)}...{item.user_id.slice(-4)}
          </Text>
          <Text style={styles.studentActions}>
            {item.total_actions} actions
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{item.score}</Text>
          <Text style={styles.scoreLabel}>pts</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Text style={styles.subtitle}>
          Top engaged students
        </Text>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{analytics?.attendance_count || 0}</Text>
          <Text style={styles.statLabel}>Attendees</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{analytics?.average_engagement_score || 0}%</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{topStudents.length}</Text>
          <Text style={styles.statLabel}>Ranked</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load leaderboard</Text>
        </View>
      ) : (
        <FlatList
          data={topStudents}
          renderItem={renderStudent}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>No rankings yet</Text>
              <Text style={styles.emptySubtext}>
                Engagement data will appear after students start participating
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0ea5e9',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
  },
  studentInfo: {
    flex: 1,
  },
  studentId: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  studentActions: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0ea5e9',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#9ca3af',
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
    textAlign: 'center',
  },
});
