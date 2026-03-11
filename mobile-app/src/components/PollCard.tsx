// Poll Card Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Poll, PollOption } from '@/types/poll';
import { colors, spacing, borderRadius } from '@/theme/colors';

interface PollCardProps {
  poll: Poll;
  onSelectOption: (poll: Poll, optionId: string) => void;
  onSubmitAnswer: (poll: Poll) => void;
  selectedOptionId?: string | null;
  submittedOptionId?: string | null;
  isSubmitting?: boolean;
}

export function PollCard({
  poll,
  onSelectOption,
  onSubmitAnswer,
  selectedOptionId,
  submittedOptionId,
  isSubmitting = false,
}: PollCardProps) {
  const isActive = (poll?.status ?? '') === 'active';
  const effectiveSelectedOptionId = submittedOptionId ?? selectedOptionId ?? null;
  const hasSubmitted = !!submittedOptionId;

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
          (() => {
            const isSelected = effectiveSelectedOptionId === option.id;
            return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              !isActive && styles.optionButtonDisabled,
              isSelected && styles.optionButtonSelected,
              hasSubmitted && styles.optionButtonSubmitted,
            ]}
            onPress={() => onSelectOption(poll, option.id)}
            disabled={!isActive || hasSubmitted || isSubmitting}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option.option_text}
              </Text>
              {isSelected ? (
                <Ionicons
                  name={hasSubmitted ? 'checkmark-circle' : 'radio-button-on'}
                  size={20}
                  color={hasSubmitted ? colors.success : colors.primary}
                />
              ) : null}
            </View>
          </TouchableOpacity>
            );
          })()
        ))}
      </View>

      {hasSubmitted ? (
        <View style={styles.submittedBanner}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.submittedText}>You selected this option.</Text>
        </View>
      ) : isActive ? (
        <TouchableOpacity
          style={[
            styles.voteButton,
            (!selectedOptionId || isSubmitting) && styles.voteButtonDisabled,
          ]}
          onPress={() => onSubmitAnswer(poll)}
          disabled={!selectedOptionId || isSubmitting}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isSubmitting ? 'time-outline' : 'checkmark-done-outline'}
            size={20}
            color={colors.white}
          />
          <Text style={styles.voteButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit answer'}
          </Text>
        </TouchableOpacity>
      ) : null}
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  optionButtonSubmitted: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  optionButtonDisabled: {
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  optionTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  voteButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  submittedBanner: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.successBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  submittedText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
});
