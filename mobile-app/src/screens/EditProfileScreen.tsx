import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius } from '@/theme/colors';
import { authService, StoredUserData } from '@/services/auth';
import { api } from '@/services/api';

type UserType = 'student' | 'professional';

interface EditProfileScreenProps {
  onBack: () => void;
  onSaved: () => void;
}

export function EditProfileScreen({ onBack, onSaved }: EditProfileScreenProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [designation, setDesignation] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const profile = await api.getMyProfile();
        if (!mounted) return;
        setName(profile.name ?? '');
        setUserType(profile.user_type ?? null);
        setUniversity(profile.university ?? '');
        setCourse(profile.course ?? '');
        setYearOfStudy(profile.year_of_study ?? '');
        setCity(profile.city ?? '');
        setState(profile.state ?? '');
        setDesignation(profile.designation ?? '');
        setCompany(profile.company ?? '');
      } catch (_) {
        const res = await authService.getCurrentUser();
        if (!mounted) return;
        const user = res.success ? res.user : null;
        setName(user?.name ?? '');
        setUserType(user?.user_type ?? null);
        setUniversity(user?.university ?? '');
        setCourse(user?.course ?? '');
        setYearOfStudy(user?.year_of_study ?? '');
        setCity(user?.city ?? '');
        setState(user?.state ?? '');
        setDesignation(user?.designation ?? '');
        setCompany(user?.company ?? '');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!userType) {
      setError('Please select Student or Working professional');
      return;
    }

    if (userType === 'student') {
      if (!university.trim() || !course.trim() || !yearOfStudy.trim() || !city.trim() || !state.trim()) {
        setError('Please complete all student profile fields');
        return;
      }
    }

    if (userType === 'professional') {
      if (!designation.trim() || !company.trim()) {
        setError('Please complete designation and company');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      const payload: Parameters<typeof api.updateMyProfile>[0] = {
        name: name.trim() || undefined,
        user_type: userType,
      };

      if (userType === 'student') {
        payload.university = university.trim();
        payload.course = course.trim();
        payload.year_of_study = yearOfStudy.trim();
        payload.city = city.trim();
        payload.state = state.trim();
      } else {
        payload.designation = designation.trim();
        payload.company = company.trim();
      }

      const updated = await api.updateMyProfile(payload);
      const nextUser: Partial<StoredUserData> = {
        id: updated?.id,
        email: updated?.email,
        name: updated?.name,
        user_type: updated?.user_type,
        university: updated?.university,
        course: updated?.course,
        year_of_study: updated?.year_of_study,
        city: updated?.city,
        state: updated?.state,
        designation: updated?.designation,
        company: updated?.company,
      };
      await authService.updateStoredUserData(nextUser);
      onSaved();
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string; error?: string } } }).response?.data?.message
          || (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      setError(message || (err instanceof Error ? err.message : 'Failed to save profile'));
    } finally {
      setSaving(false);
    }
  };

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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Edit Profile</Text>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                editable={!saving}
              />
            </View>

            <Text style={styles.inputLabel}>I am a</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[styles.optionButton, userType === 'student' && styles.optionButtonActive]}
                onPress={() => setUserType('student')}
                disabled={saving}
              >
                <Text style={[styles.optionText, userType === 'student' && styles.optionTextActive]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, userType === 'professional' && styles.optionButtonActive]}
                onPress={() => setUserType('professional')}
                disabled={saving}
              >
                <Text style={[styles.optionText, userType === 'professional' && styles.optionTextActive]}>Working Professional</Text>
              </TouchableOpacity>
            </View>

            {userType === 'student' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>University</Text>
                  <TextInput value={university} onChangeText={setUniversity} style={styles.input} placeholder="Your university" placeholderTextColor={colors.textMuted} editable={!saving} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Course</Text>
                  <TextInput value={course} onChangeText={setCourse} style={styles.input} placeholder="Course" placeholderTextColor={colors.textMuted} editable={!saving} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Year of Study</Text>
                  <TextInput value={yearOfStudy} onChangeText={setYearOfStudy} style={styles.input} placeholder="Year of study" placeholderTextColor={colors.textMuted} editable={!saving} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput value={city} onChangeText={setCity} style={styles.input} placeholder="City" placeholderTextColor={colors.textMuted} editable={!saving} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>State</Text>
                  <TextInput value={state} onChangeText={setState} style={styles.input} placeholder="State" placeholderTextColor={colors.textMuted} editable={!saving} />
                </View>
              </>
            ) : null}

            {userType === 'professional' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Designation</Text>
                  <TextInput value={designation} onChangeText={setDesignation} style={styles.input} placeholder="Designation" placeholderTextColor={colors.textMuted} editable={!saving} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Company</Text>
                  <TextInput value={company} onChangeText={setCompany} style={styles.input} placeholder="Company" placeholderTextColor={colors.textMuted} editable={!saving} />
                </View>
              </>
            ) : null}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
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
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  optionTextActive: {
    color: colors.white,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
