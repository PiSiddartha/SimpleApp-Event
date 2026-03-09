// Poll Card Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Poll, PollOption } from '@/types/poll';
import { colors, spacing, borderRadius } from '@/theme/colors';

interface PollCardProps {
  poll: Poll;
  onVote: (poll: Poll) => void;
}

export function PollCard({ poll, onVote }: PollCardProps) {
  const isActive = (poll?.status ?? '') === 'active';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.question}>{poll?.question ?? 'Poll'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: isActive ? `${colors.successMuted}20` : `${colors.textSecondary}20` }]}>
          <Text style={[styles.statusText, { color: isActive ? colors.successMuted : colors.textSecondary }]}>
            {poll?.status ?? '—'}
          </Text>
        </View>
      </View>

      <View style={styles.options}>
        {(poll?.options ?? []).map((option: PollOption) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionButton}
            onPress={() => onVote(poll)}
            disabled={!isActive}
          >
            <Text style={styles.optionText}>{option.option_text}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {isActive && (
        <TouchableOpacity 
          style={styles.voteButton}
          onPress={() => onVote(poll)}
        >
          <Text style={styles.voteButtonText}>Vote</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  options: {
    gap: spacing.sm,
  },
  optionButton: {
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },
  voteButton: {
    marginTop: spacing.lg,
    padding: 14,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  voteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});
