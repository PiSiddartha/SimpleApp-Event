// Poll Screen
import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { usePoll, usePollResults, useCastVote } from '@/hooks/usePolls';
import { api } from '@/services/api';
import { PollOption } from '@/types/poll';
import { colors, spacing, borderRadius } from '@/theme/colors';

interface PollScreenProps {
  pollId: string;
  onBack: () => void;
}

export function PollScreen({ pollId, onBack }: PollScreenProps) {
  const { data: poll, isLoading: pollLoading } = usePoll(pollId);
  const { data: results, isLoading: resultsLoading, refetch } = usePollResults(pollId);
  const castVote = useCastVote();

  const handleVote = async (optionId: string) => {
    try {
      await castVote.mutateAsync({ pollId, optionId });
      Alert.alert('Success', 'Your vote has been recorded!');
      refetch();
    } catch (error: any) {
      if (error.response?.data?.message?.includes('already voted')) {
        Alert.alert('Info', 'You have already voted in this poll');
      } else {
        Alert.alert('Error', 'Failed to submit vote');
      }
    }
  };

  if (pollLoading || resultsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!poll) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Poll not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalVotes = results?.results?.reduce((sum: number, r: { option: string; votes: number }) => sum + r.votes, 0) || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.question}>{poll.question}</Text>
          
          <View style={[styles.statusBadge, { 
            backgroundColor: poll.status === 'active' ? '#22c55e20' : '#6b728020' 
          }]}>
            <Text style={[styles.statusText, { 
              color: poll.status === 'active' ? '#22c55e' : '#6b7280' 
            }]}>
              {poll.status}
            </Text>
          </View>
        </View>

        {/* Voting Options */}
        {poll.status === 'active' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast Your Vote</Text>
            {poll.options?.map((option: PollOption) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionButton}
                onPress={() => handleVote(option.id)}
                disabled={castVote.isPending}
              >
                <Text style={styles.optionText}>{option.option_text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📊 Results ({totalVotes} votes)
          </Text>
          
          {results?.results?.map((result: { option: string; votes: number }, index: number) => {
            const percentage = totalVotes > 0 
              ? Math.round((result.votes / totalVotes) * 100) 
              : 0;
            
            return (
              <View key={index} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultOption}>{result.option}</Text>
                  <Text style={styles.resultVotes}>
                    {result.votes} votes ({percentage}%)
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${percentage}%` }]} 
                  />
                </View>
              </View>
            );
          })}
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
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    padding: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 14,
  },
  optionButton: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginBottom: 10,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  resultItem: {
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  resultOption: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  resultVotes: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});
