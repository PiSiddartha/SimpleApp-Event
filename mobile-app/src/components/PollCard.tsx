// Poll Card Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Poll, PollOption } from '@/types/poll';

interface PollCardProps {
  poll: Poll;
  onVote: (poll: Poll) => void;
}

export function PollCard({ poll, onVote }: PollCardProps) {
  const isActive = poll.status === 'active';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.question}>{poll.question}</Text>
        <View style={[styles.statusBadge, { backgroundColor: isActive ? '#22c55e20' : '#6b728020' }]}>
          <Text style={[styles.statusText, { color: isActive ? '#22c55e' : '#6b7280' }]}>
            {poll.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.options}>
        {poll.options?.map((option: PollOption) => (
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  question: {
    fontSize: 16,
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
  options: {
    gap: 8,
  },
  optionButton: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
  },
  voteButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
  },
  voteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
