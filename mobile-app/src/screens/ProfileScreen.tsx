// Profile Screen – user info and sign out
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/theme/colors';
import { authService } from '@/services/auth';

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

type ProfileUser = {
  id?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
};

export function ProfileScreen({ onBack, onLogout }: ProfileScreenProps) {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    authService.getCurrentUser().then((res) => {
      if (mounted) {
        setUser(res.success ? res.user : null);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
        </View>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.card}>
          {(user?.name ?? user?.given_name ?? user?.family_name) ? (
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value} numberOfLines={2}>
                {user?.name ?? ([user?.given_name, user?.family_name].filter(Boolean).join(' ').trim() || '—')}
              </Text>
            </View>
          ) : null}
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value} numberOfLines={1}>{user?.email ?? '—'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.white} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backText: {
    fontSize: 17,
    color: colors.text,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}18`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rowLast: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.md,
    textAlign: 'right',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    marginTop: spacing.lg,
  },
  signOutText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
  },
});
