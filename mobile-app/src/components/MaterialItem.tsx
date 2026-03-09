// Material Item Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Material } from '@/types/material';
import { colors, spacing, borderRadius } from '@/theme/colors';

interface MaterialItemProps {
  material: Material;
  onDownload: (material: Material) => void;
}

function getFileIconName(fileType?: string): React.ComponentProps<typeof Ionicons>['name'] {
  if (!fileType) return 'document';
  const lower = fileType.toLowerCase();
  if (lower.includes('pdf')) return 'document-text';
  if (lower.includes('word') || lower.includes('document')) return 'document';
  if (lower.includes('powerpoint') || lower.includes('presentation')) return 'document-attach';
  if (lower.includes('video')) return 'videocam';
  if (lower.includes('zip') || lower.includes('archive')) return 'archive';
  return 'document';
}

export function MaterialItem({ material, onDownload }: MaterialItemProps) {
  const iconName = getFileIconName(material.file_type);

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name={iconName} size={26} color={colors.primary} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{material?.title ?? 'Untitled'}</Text>
        <Text style={styles.type}>{material?.file_type || 'File'}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => onDownload(material)}
        activeOpacity={0.7}
      >
        <Ionicons name="download-outline" size={20} color={colors.primary} />
        <Text style={styles.downloadText}>Download</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: 14,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}14`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  type: {
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: `${colors.primary}14`,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
