// Course Detail Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCourse, useRegisterCourse } from '@/hooks/useCourses';
import { colors, spacing, borderRadius } from '@/theme/colors';
import type { CoursePhase } from '@/types/course';

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  android: {
    elevation: 2,
  },
});

interface CourseDetailScreenProps {
  courseId: string;
  onBack: () => void;
}

export function CourseDetailScreen({ courseId, onBack }: CourseDetailScreenProps) {
  const { data: course, isLoading, error, refetch, isRefetching } = useCourse(courseId);
  const registerCourse = useRegisterCourse();
  const [registered, setRegistered] = useState(false);

  const handleRegister = async () => {
    try {
      await registerCourse.mutateAsync(courseId);
      setRegistered(true);
      Alert.alert('Success', 'You have registered for this course.');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.response?.data?.error ?? 'Failed to register for course.';
      Alert.alert('Error', msg);
    }
  };

  if (isLoading || !course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course</Text>
        </View>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Failed to load course.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const highlights = course.highlights ?? [];
  const phases = course.phases ?? [];
  const benefits = course.benefits ?? [];
  const audience = course.audience ?? [];
  const careerOutcomes = course.career_outcomes ?? [];
  const certificate = course.certificate;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{course.title}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {(course.short_description || course.full_description) && (
          <View style={styles.introBlock}>
            {course.short_description ? (
              <Text style={styles.shortDesc}>{course.short_description}</Text>
            ) : null}
            {course.full_description ? (
              <Text style={styles.fullDesc}>{course.full_description}</Text>
            ) : null}
          </View>
        )}

        {highlights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <View style={styles.highlightGrid}>
              {highlights.map((h: { label: string; value: string }, i: number) => (
                <View key={i} style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>{h.label}</Text>
                  <Text style={styles.highlightValue}>{h.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {phases.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phases / Modules</Text>
            {phases.map((phase: CoursePhase, i: number) => (
              <View key={phase.id ?? i} style={styles.phaseCard}>
                <Text style={styles.phaseTitle}>{phase.title}</Text>
                {phase.subtitle ? <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text> : null}
                {phase.phase_items && phase.phase_items.length > 0 && (
                  <View style={styles.phaseItems}>
                    {phase.phase_items.map((item: { text: string }, j: number) => (
                      <Text key={j} style={styles.phaseItemText}>• {item.text}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            <View style={styles.benefitsCard}>
              {benefits.map((b: { title: string; description?: string }, i: number) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bulletTitle}>{b.title}</Text>
                  {b.description ? <Text style={styles.bulletDesc}>{b.description}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        )}

        {audience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who should attend</Text>
            <View style={styles.benefitsCard}>
              {audience.map((a: { title: string; description?: string }, i: number) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bulletTitle}>{a.title}</Text>
                  {a.description ? <Text style={styles.bulletDesc}>{a.description}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        )}

        {careerOutcomes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Career outcomes</Text>
            <View style={styles.outcomesCard}>
              {careerOutcomes.map((c: { text: string }, i: number) => (
                <Text key={i} style={styles.bulletText}>• {c.text}</Text>
              ))}
            </View>
          </View>
        )}

        {certificate && (certificate.title || certificate.provider) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certificate</Text>
            <View style={styles.certCard}>
              {certificate.title ? <Text style={styles.bulletTitle}>{certificate.title}</Text> : null}
              {certificate.provider ? <Text style={styles.bulletDesc}>Provider: {certificate.provider}</Text> : null}
            </View>
          </View>
        )}

        <View style={styles.registerSection}>
          {registered ? (
            <View style={[styles.registerBtn, styles.registeredBtn]}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <Text style={styles.registeredText}>Registered</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={handleRegister}
              disabled={registerCourse.isPending}
              activeOpacity={0.75}
            >
              {registerCourse.isPending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="book-outline" size={22} color={colors.white} />
                  <Text style={styles.registerBtnText}>Register to this course</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  backBtn: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  errorText: {
    fontSize: 15,
    color: colors.error,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  introBlock: {
    marginBottom: spacing.xl,
  },
  shortDesc: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  fullDesc: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: -0.2,
  },
  highlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  highlightItem: {
    minWidth: '45%',
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  highlightLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  highlightValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  phaseCard: {
    padding: spacing.lg,
    paddingLeft: spacing.lg + 2,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  phaseSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  phaseItems: {
    marginTop: spacing.md,
    paddingLeft: spacing.xs,
  },
  phaseItemText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 21,
  },
  benefitsCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  outcomesCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  certCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  bulletItem: {
    marginBottom: spacing.md,
  },
  bulletTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  bulletDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 21,
  },
  registerSection: {
    marginTop: spacing.xxl,
    paddingTop: spacing.lg,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl + 2,
    ...cardShadow,
  },
  registerBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  registeredBtn: {
    backgroundColor: colors.successBg,
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  registeredText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
});
